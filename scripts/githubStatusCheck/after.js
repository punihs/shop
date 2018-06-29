const mysql = require('mysql2');
const rp = require('request-promise');

const { log } = console;
const DRONE_COMMIT = process.argv[2];

log('DRONE_COMMIT', process.argv, DRONE_COMMIT);

const fgRed = '\x1b[31m';
const fgGreen = '\x1b[32m';
const fgDim = '\x1b[2m';
const fgReset = '\x1b[0m';

const SLOW = 100;
const NORMAL = 200;


const ciConnection = mysql.createConnection({
  host: 'cp2-aws.ayyayo.com',
  user: 'shoppre_ci',
  database: 'shoppre_ci',
  password: 'abB^gu5m}ePC',
});

const connection = mysql.createConnection({
  host: 'staging-mysql1.shoppre.com',
  user: 'pulse',
  database: 'shoppre_q_test',
  password: 'X*vf^35$R`ea-"c2',
});

ciConnection.query(
  'select average_response_time, moderate, normal, slow from builds order by id desc limit 1',
  (err, [last]) => {
    log('LAST_RESPONSE_TIME', { err, last });

    connection.query(
      'select FLOOR(avg(response_time)) as average_response_time from logs',
      (er, res) => {
        log('CURRENT_AVG_RESPONSE_TIME', er, res);
        if (er) {
          process.exit(1);
          return log('er', er);
        }

        const [current] = res;
        const token = '7a22c7cf18addb1df993341ed4eab843b2ca04bc';

        const list = 'select response_time, request from logs';
        return connection.query(list, (error, result) => {
          log(Object.keys(result[0]).join('\t\t'));

          let n = 0;
          let m = 0;
          let s = 0;

          result.forEach((x) => {
            let color;
            if (x.response_time < NORMAL) {
              color = fgGreen;
              n += 1;
            } else if (x.response_time < SLOW) {
              color = fgDim;
              m += 1;
            } else {
              color = fgRed;
              s += 1;
            }

            log(color, Object.values(x).join('\t\t'), fgReset);
          });

          const u = 'insert into builds (average_response_time, sha, normal, moderate, slow) values (?,?,?,?,?)';
          return ciConnection
            .query(u, [current.average_response_time, DRONE_COMMIT, n, m, s], (e) => {
              log('new response time added to sequelize ci db', { e });

              const state = current.average_response_time < Number(last.average_response_time)
                ? 'success'
                : 'failure';

              const { normal, slow, moderate } = last;

              const div = current.average_response_time / Number(last.average_response_time);
              const percentage = (((div) - 1) * 100)
                .toFixed(2);

              const p = `${current.average_response_time}(${percentage}%)`;
              const nms = `${n}(${normal}), moderate: ${m}(${moderate}), slow: ${s}(${slow})`;
              const description = `${p} - normal:  ${nms}`;
              log('description: ', description);

              return rp({
                method: 'POST',
                uri: `https://api.github.com/repos/shoppre/api/statuses/${DRONE_COMMIT}?access_token=${token}`,
                headers: {
                  'user-agent': 'Shoppre request-promise',
                },
                body: {
                  state,
                  target_url: 'https://metabase.quezx.com/',
                  description,
                  context: 'continuous-integration/sequelize',
                },
                json: true,
              })
                .then(() => {
                  log('github status updated: ', state, current);
                  process.exit(0);
                })
                .catch(le => log('github status update error: ', le));
            });
        });
      },
    );
  },
);

