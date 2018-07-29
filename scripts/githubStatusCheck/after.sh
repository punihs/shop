#!/usr/bin/env bash
LAST_RESPONSE_TIME=$(mysql -h cp2-aws.ayyayo.com -u shoppre_ci -p"abB^gu5m}ePC" shoppre_ci -s -N -e "select average_response_time from builds order by id desc limit 1")
CURRENT_AVG_RESPONSE_TIME=$(mysql -h staging-mysql1.shoppre.com -u pulse -p'X*vf^35$R`ea-"c2' shoppre_q_test -s -N -e "select FLOOR(avg(response_time)) from logs")
echo "LAST_RESPONSE_TIME:$LAST_RESPONSE_TIME";
echo "CURRENT_AVG_RESPONSE_TIME:$CURRENT_AVG_RESPONSE_TIME";
echo
if (( LAST_RESPONSE_TIME > CURRENT_AVG_RESPONSE_TIME )); then

  export STATUS="success"
else
  export STATUS="failure"
fi
echo "$STATUS"
GIT_COMMIT=$(git rev-parse HEAD)
curl "https://api.github.com/repos/shoppre/api/statuses/$GIT_COMMIT?access_token=7a22c7cf18addb1df993341ed4eab843b2ca04bc" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{\"state\": \"$STATUS\", \"description\": \"Sequelize CI\", \"target_url\": \"https://pulse.shoppre.com/$BUILD_NUMBER\"}"
mysql -h staging-mysql1.shoppre.com -u pulse -p'X*vf^35$R`ea-"c2' shoppre_q_test -s -N -e "select response_time,request from logs"
