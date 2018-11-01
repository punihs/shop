module.exports = params => ({
  from: params.Source,
  subject: params.Subject,
  replyTo: params.ReplyTo,
  to: params.Destination.ToAddresses,
  cc: params.Destination.CcAddresses,
  bcc: params.Destination.BccAddresses,
  html: params.Body.Html.Data,
});
