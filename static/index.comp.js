"use strict";var _extends=Object.assign||function(c){for(var f,d=1;d<arguments.length;d++)for(var g in f=arguments[d],f)Object.prototype.hasOwnProperty.call(f,g)&&(c[g]=f[g]);return c},votingTemplate=Handlebars.compile($("#voting-table").html()),numberRegex=/[0-9]/,pin;$("#pin-input").on("keypress",function(c){var d=c.which||c.code;return c.key=c.key||String.fromCharCode(d),numberRegex.test(c.key)&&4!==$("#pin-input").val().length?void(3===$("#pin-input").val().length&&($("#pin-input").val($("#pin-input").val()+c.key),$("#pin-input").prop("disabled",!0).blur(),pin=("0000"+parseInt($("#pin-input").val())).substr(-4,4),submitPin(pin))):(c.preventDefault(),void c.stopPropagation())});var teacher=void 0,school=void 0,currentIndex=0;function submitPin(c){axios.post("api/load",{pin:c}).then(function(d){return d.data}).then(function(d){d.success?(teacher=d.teacher,school=teacher.school,school.positions=school.positions.map(function(f){return _extends({},f,{rubrics:f.rubrics.map(function(g){return{name:g.name,excellent:g.descriptions[0],veryGood:g.descriptions[1],good:g.descriptions[2]}})})}),showViews(),$("body").addClass("voting")):("pin_not_found"==d.message&&alert("Unknown pin."),"pin_already_used"==d.message&&alert("Pin has already been used."),$("#pin-input").prop("disabled",!1).focus().val(""))}).catch(function(d){throw alert("Oh no! Something went wrong!"),alert("Don't close this alert.\n\n"+d.stack||d),d})}function showViews(){$("#page-form").on("submit",formSubmit),$("#abstain-button").on("click",function(){var g=prompt("What is your reason for abstaining? Leave blank to cancel.");g&&(axios.post("api/abstain",{nominator:teacher._id,position:school.positions[currentIndex]._id,reason:g}),nextView())}),showPosition(school.positions[0]);var _iteratorNormalCompletion=!0,_didIteratorError=!1,_iteratorError=void 0;try{for(var d,f,c=school.teachers.sort(function(g,h){return g.name>h.name?1:-1})[Symbol.iterator]();!(_iteratorNormalCompletion=(d=c.next()).done);_iteratorNormalCompletion=!0)f=d.value,$("#nominee").append($("<option>").attr("value",f._id).text(f.name))}catch(g){_didIteratorError=!0,_iteratorError=g}finally{try{!_iteratorNormalCompletion&&c.return&&c.return()}finally{if(_didIteratorError)throw _iteratorError}}}function resizeTable(){$("#rubrics-table tbody tr").each(function(){var c=$(this),d=0;c.find("td").each(function(){$(this).height()>d&&(d=$(this).height())}),c.find("label").height(d-32)})}$(window).on("resize",resizeTable);function showPosition(c){$(".page-header").text(c.name),console.log(c);var d=votingTemplate(c);$("#rubrics-table tbody").empty().append(d),$("#nominee").val(""),$("#comments").val(""),resizeTable()}function formSubmit(c){if(c.preventDefault(),c.stopPropagation(),!!confirm("Are you sure you want to continue?")){var d=$(this).serializeArray(),f=school.positions[currentIndex]._id,g=d.find(function(l){return"nominee"==l.name}).value,h=teacher._id,j=d.find(function(l){return"comments"==l.name}).value,k=d.filter(function(l){return!isNaN(parseInt(l.name))}).map(function(l){return parseInt(l.value)});axios.post("api/nominate",{position:f,nominee:g,nominator:h,reason:j,ratings:k}).then(function(l){return l.data}).then(function(l){l.success&&console.log("Submitted")}),nextView()}}function nextView(){return currentIndex++,currentIndex==school.positions.length?(alert("Thank you for participating!"),void $("body").empty()):void showPosition(school.positions[currentIndex])}