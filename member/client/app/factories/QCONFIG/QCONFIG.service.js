'use strict';

angular.module('uiGenApp')
  .factory('QCONFIG', function () {
    // Public API here
    return {
      APPLICANT_STATES: ['Tasks', 'Shortlisted', 'Feedback', 'Rejected', 'All', 'Interview', 'Bookmarked'],
      MANAGE_JD_STATES: ['New', 'Accepted', 'Hidden', 'Rejected', 'All'],
    };
  });
