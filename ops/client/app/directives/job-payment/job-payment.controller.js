class JobPaymentController {
  constructor($uibModalInstance, $http, $log, job, awfTime, moment) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$log = $log;
    this.job = job;
    this.moment = moment;
    this.awfTime = awfTime && this.moment(awfTime);
    this.JOB_TYPE = {
      0: 'EMI - Standard',
      1: 'Fixed - Standard',
      2: 'Fixed - Customised',
      3: 'EMI - Customised',
      4: 'Designation - Fixed',
      5: 'Designation - EMI',
    };
    this.$http.get(`/jobs/${this.job.id}/clientPayments`)
      .then(({ data: response }) => {
        const paymentDetails = _.without(response[0].concat(response[1]), null, undefined);
        this.paymentDetails = paymentDetails;
        const groupsPaymentDetails = _.uniq(_.pluck(paymentDetails,
          'start_time')).sort().reverse();
        this.groupsPaymentDetails = groupsPaymentDetails;
        const comments = _.uniq(paymentDetails, (item) => item.consultant_comment);
        const internalComments = _.uniq(paymentDetails, (item) => item.internal_comment);

        this.paymentDetailsComments = _.without(_.pluck(comments,
          'consultant_comment'), null);
        this.additionalComments = _.without(_.pluck(internalComments,
          'internal_comment'), null);
        this.$http.get(`/jobs/${this.job.id}/clientPaymentsDesigId`)
        .then(({ data: desigantions }) => {
          this.jobDesignationId = desigantions;
          this.clientPaymentDesigId = desigantions;
        })
        .catch(err => this.$log.error('Error while getting client payments designation id', err));
      })
      .catch(err => this.$log.error('Error while getting client payments', err));
    this.active = true;
    this.active1 = true;
    this._ = _;
  }

  isActiveAgreement(agreement) {
    if (!this.awfTime) return false;
    const start = this.awfTime.isBefore(this.moment(agreement.end_time));
    const end = this.awfTime.isAfter(this.moment(agreement.start_time));
    return start && end;
  }
}

angular.module('uiGenApp')
  .controller('JobPaymentController', JobPaymentController);
