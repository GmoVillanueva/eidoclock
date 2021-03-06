var has_notified = false;
var nice_background = true;
var simple_layout = false;

document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

var eidolon_sound = new Audio('eidolon.mp3');
var door_sound = new Audio('door.wav');
// eidolon_sound.play()
var has_played_night = false;
var has_played_day = false;
var first_run = true;

function notify(string) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('The Eidoclock', {
      icon: '',
      body: string
    });
  }
}
function pad(s) {
	if (s.toString().length == 1) return '0' + s.toString();
	return s.toString();
}

function updateTime() {
	nice_background = $('#background').is(':checked');
	simple_layout = $('#simple').is(':checked');
	if (simple_layout) {
		$('.until-container').css('opacity', 1);
	} else {
		$('.until-container').css('opacity', 0);
	}

	var d = new Date();
	var time = d.getTime() / 1000;
    // This time is the end of night and start of day
    var start_time = (1510894634 - 150 * 60) + 7 * 60 + 18;
	var irltime_m = ((time - start_time)/60) % 150;  // 100m of day + 50m of night
	
	var eidotime_in_h = (irltime_m / 6.25) + 6;
	if (eidotime_in_h < 0) eidotime_in_h += 24;
	if (eidotime_in_h > 24) eidotime_in_h -= 24;
	var eidotime_h = Math.floor(eidotime_in_h);
	var eidotime_m = Math.floor((eidotime_in_h * 60) % 60);
	var eidotime_s = Math.floor((eidotime_in_h * 60 * 60) % 60);

	var wrapped_time = eidotime_in_h - 5;
	if (wrapped_time < 0) wrapped_time += 24;
	var slider_percent = wrapped_time / 24 * 90 + 5
	$('.slider').css('top', slider_percent + '%');

	var next_interval;

	// Night is from 9pm to 5am
	// Day is from 5am to 9pm
	if (150 - irltime_m > 50) {
        if (!has_played_day) {
            has_played_night = false;
            has_played_day = true;
            if (first_run) {
                first_run = false;
            } else {
                notify("It is day!");
            }
        }
		// Time is day
		if (nice_background) {
			$('body').css('background', "url(day_blur.jpg) no-repeat center center fixed");
		} else {
			$('body').css('background-image', "none");
			$('body').css('background-color', "black");
		}
		$('.day').addClass('night').removeClass('day');
		$('.night').text('night');
		next_interval = 21;
	} else {
		// Time is night
        if (!has_played_night) {
            has_played_night = true;
            has_played_day = false;
            if (first_run) {
                first_run = false;
            } else {
                notify("It is night!");
                eidolon_sound.play();
            }
        }
		if (nice_background) {
			$('body').css('background', "url(night_blur.jpg) no-repeat center center fixed");
		} else {
			$('body').css('background', "black");
			$('body').css('color', "white");
		}
		$('.night').addClass('day').removeClass('night');
		$('.day').text('day');
		next_interval = 5;
	}
	$('body').css('background-size', "cover");

	if (eidotime_h == 22) has_notified = false;
	var eido_until_h = next_interval - (eidotime_h % 24);
	if (eido_until_h < 0) eido_until_h += 24
	var eido_until_m = 60 - eidotime_m;
	var eido_until_s = 60 - eidotime_s;

	var irl_until_in_h = ((eido_until_h + eido_until_m / 60 + eido_until_s / 60 / 60) * 6.25) / 60;

    var irl_until_in_m = 150 - irltime_m;

    if (irl_until_in_m > 50) irl_until_in_m -= 50 

	var irl_until_h = Math.floor(irl_until_in_m / 60);
	var irl_until_m = Math.floor(irl_until_in_m % 60);
	var irl_until_s = Math.floor((irl_until_in_m * 60) % 60);

	// var irl_until_h = Math.floor(irl_until_in_h);
	// var irl_until_m = Math.floor((irl_until_in_h * 60) % 60);
	// var irl_until_s = Math.floor((irl_until_in_h * 60 * 60) % 60);
	
	$('.time>.big-hour').text(pad(irl_until_h));
	$('.time>.big-minute').text(pad(irl_until_m));
	$('.time>.big-second').text(pad(irl_until_s));

	$('.eidolon .hour').text(pad(eidotime_h));
	$('.eidolon .minute').text(pad(eidotime_m));
	$('.eidolon .second').text(pad(eidotime_s));

	$('.irl .hour').text(pad(eido_until_h));
	$('.irl .minute').text(pad(eido_until_m));
	$('.irl .second').text(pad(eido_until_s));

	// $('.time>.ampm').text(((eidotime_in_h >= 12) ? ' pm' : ' am'));
}

var interval = setInterval(updateTime, 1);
