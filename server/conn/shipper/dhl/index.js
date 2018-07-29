const debug = require('debug');
const xml2js = require('xml2js');
const rp = require('request-promise');
const { promisify } = require('bluebird');

const log = debug('conn-shipper-dhl');

const body = `<?xml version="1.0" encoding="UTF-8"?>
  <req:KnownTrackingRequest xmlns:req="http://www.dhl.com"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.dhl.com
              TrackingRequestKnown.xsd">
    <Request>
      <ServiceHeader>
        <MessageTime>2002-06-25T11:28:56-08:00</MessageTime>
        <MessageReference>1234567890123456789012345678</MessageReference>
              <SiteID>DServiceVal</SiteID>
              <Password>testServVal</Password>
      </ServiceHeader>
    </Request>
    <LanguageCode>en</LanguageCode>
    <AWBNumber>{{trackingCode}}</AWBNumber>
    <LevelOfDetails>ALL_CHECK_POINTS</LevelOfDetails>
    <PiecesEnabled>S</PiecesEnabled> 
  </req:KnownTrackingRequest>`;

const xml2json = (xml) => {
  const parser = new xml2js.Parser({ explicitArray: false, trim: true });
  return promisify(parser.parseString)(xml);
};

const status = (trackingCode) => {
  log('status', trackingCode);
  return rp({
    method: 'POST',
    uri: 'http://xmlpitest-ea.dhl.com/XMLShippingServlet',
    body: body.replace('{{trackingCode}}', trackingCode),
    headers: {
      'Content-Type': 'text/xml;charset=utf-8',
    },
  })
    .then((response) => {
      log('response from dhl', response);
      return xml2json(response);
    });
};

exports.status = status;

exports.lastStatus = (trackingCode) => {
  log('status', trackingCode);
  return status(trackingCode)
    .then((response) => {
      log('response', response);
      const { AWBInfo } = response['req:TrackingResponse'];
      log('response', AWBInfo);

      if (!(AWBInfo && AWBInfo.length)) {
        /* eslint prefer-promise-reject-errors:0 */
        return Promise
          .reject({ message: 'wrong shipment tracking number' });
      }

      const events = AWBInfo[1].ShipmentInfo.ShipmentEvent;
      const lastEvent = events[events.length - 1];
      const timestamp = `${lastEvent.Date} ${lastEvent.Time}`;
      return {
        status: {
          timestamp,
          message: lastEvent.ServiceEvent.Description,
        },
        customPayload: {
          timestamp,
          service_event_code: lastEvent.ServiceEvent.EventCode,
          service_event_description: lastEvent.ServiceEvent.Description,
          signatory: lastEvent.Signatory,
          service_area_code: lastEvent.ServiceArea.ServiceAreaCode,
          service_area_dscription: lastEvent.ServiceArea.Description,
        },
      };
    });
};

