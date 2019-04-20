/* custom JS goes here */

// IIFE
(function(){
  $(".btn-danger").click(function(event){
    if(!confirm("Are you sure?")) {
      event.preventDefault();
      window.location.assign("/surveys/mySurveys");
    }
  });
})();


$(function () {
  $('#datetimepicker1').datetimepicker({
    locale:'en-ca',
    //disable datepicker's date before today
    minDate:new Date()
  });
   $('#datetimepicker2').datetimepicker({
    locale:'en-ca',
    //disable datepicker's date before today
    //minDate:new Date()
     useCurrent: false
  });

  $("#datetimepicker1").on("dp.change", function (e) {
            $('#datetimepicker2').data("DateTimePicker").minDate(e.date);
        });
        $("#datetimepicker2").on("dp.change", function (e) {
            $('#datetimepicker1').data("DateTimePicker").maxDate(e.date);
        });
})();


//get local time zone offset to timezone input value
function timeChange(){
      let time = moment().utcOffset();
      document.getElementById('timezone').value = time;
  }               


//showing local timezone
function showTimeOffset() {
  let time = moment().utcOffset();
    alert(time);
}
