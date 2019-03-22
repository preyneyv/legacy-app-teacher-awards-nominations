function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var votingTemplate = Handlebars.compile($("#voting-table").html());
var numberRegex = /[0-9]/;
var pin;
$("#pin-input").on('keypress', function (e) {
  var code = e.which || e.code;
  e.key = e.key || String.fromCharCode(code);

  if (!numberRegex.test(e.key) || $("#pin-input").val().length === 4) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if ($("#pin-input").val().length === 3) {
    $('#pin-input').val($('#pin-input').val() + e.key);
    $("#pin-input").prop('disabled', true).blur();
    pin = ("0000" + parseInt($("#pin-input").val())).substr(-4, 4);
    submitPin(pin);
  }
});
var teacher,
    school,
    currentIndex = 0;

function submitPin(pin) {
  axios.post('api/load', {
    pin: pin
  }).then(function (response) {
    return response.data;
  }).then(function (data) {
    if (data.success) {
      // We're in business!
      teacher = data.teacher;
      school = teacher.school;
      school.positions = school.positions.map(function (position) {
        return _objectSpread({}, position, {
          rubrics: position.rubrics.map(function (rubric) {
            return {
              name: rubric.name,
              excellent: rubric.descriptions[0],
              veryGood: rubric.descriptions[1],
              good: rubric.descriptions[2]
            };
          })
        });
      });
      showViews();
      $('body').addClass('voting');
    } else {
      if (data.message == 'pin_not_found') alert('Unknown pin.');
      if (data.message == 'pin_already_used') alert('Pin has already been used.');
      $('#pin-input').prop('disabled', false).focus().val('');
    }
  }).catch(function (e) {
    alert("Oh no! Something went wrong!");
    alert("Don't close this alert.\n\n" + e.stack || e);
    throw e;
  });
}

function showViews() {
  $('#page-form').on('submit', formSubmit);
  $('#abstain-button').on('click', function () {
    var reason = prompt('What is your reason for abstaining? Leave blank to cancel.');
    if (!reason) return;
    axios.post('api/abstain', {
      nominator: teacher._id,
      position: school.positions[currentIndex]._id,
      reason: reason
    });
    nextView();
  });
  showPosition(school.positions[0]);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = school.teachers.sort(function (a, b) {
      return a.name > b.name ? 1 : -1;
    })[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var t = _step.value;
      $('#nominee').append($('<option>').attr('value', t._id).text(t.name));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function resizeTable() {
  $("#rubrics-table tbody tr").each(function () {
    var row = $(this);
    var max = 0;
    row.find('td').each(function () {
      if ($(this).height() > max) max = $(this).height();
    });
    row.find('label').height(max - 32);
  });
}

$(window).on('resize', resizeTable);

function showPosition(position) {
  $('.page-header').text(position.name);
  $('.page-description span').text(position.description);
  console.log(position);
  var table = votingTemplate(position);
  $("#rubrics-table tbody").empty().append(table);
  $("#nominee").val('');
  $("#comments").val('');
  resizeTable();
}

function formSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!confirm('Are you sure you want to continue?')) return;
  var array = $(this).serializeArray();
  var position = school.positions[currentIndex]._id;
  var nominee = array.find(function (e) {
    return e.name == 'nominee';
  }).value;
  var nominator = teacher._id;
  var reason = array.find(function (e) {
    return e.name == 'comments';
  }).value;
  var ratings = array.filter(function (e) {
    return !isNaN(parseInt(e.name));
  }).map(function (rating) {
    return parseInt(rating.value);
  });
  axios.post('api/nominate', {
    position: position,
    nominee: nominee,
    nominator: nominator,
    reason: reason,
    ratings: ratings
  }).then(function (response) {
    return response.data;
  }).then(function (data) {
    if (data.success) {
      console.log("Submitted");
    }
  });
  nextView();
}

function nextView() {
  currentIndex++;

  if (currentIndex == school.positions.length) {
    // We're done!
    alert('Thank you for participating!');
    window.location.reload();
    return;
  }

  showPosition(school.positions[currentIndex]);
}
