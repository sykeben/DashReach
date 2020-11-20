// Get URL parameters.
var searchParams = new URLSearchParams(window.location.search);

// Initialize globals.
var periodCount = 0;

// Period appender function.
function appendPeriod(initialName='', initialStart='', initialEnd='') {

    // Advance counter.
    periodCount++;

    // Create element.
    $('#periods').append(`<div class="form-row period-row pb-3">

        <div class="col-4 pr-0">
            <input type="text" class="form-control period-name" placeholder="Period Name" value="${initialName}">
        </div>

        <div class="col-3 pl-1 pl-sm-2 pl-lg-4 pr-0">
            <input type="time" class="form-control period-start" value="${initialStart}">
        </div>

        <div class="col-3 pl-1 pl-sm-2 pl-lg-4 pr-0">
            <input type="time" class="form-control period-end" value="${initialEnd}">
        </div>

        <div class="col-2 pl-0 text-right">
            <button class="font-weight-bolder btn btn-sm btn-danger period-delete">&Cross;</button>
            <button class="font-weight-bolder btn btn-sm btn-primary period-move-up">&UpArrow;</button>
            <button class="font-weight-bolder btn btn-sm btn-secondary period-move-down">&DownArrow;</button>
        </div>

    </div>`);

    // Bind delete event.
    $('#periods .period-row:last-of-type .period-delete').click(function() {
        if (periodCount > 1) {
            $(this).parent().parent('.period-row').remove();
            periodCount--;
        } else {
            alert('You must have at least one (1) period.');
        }
    });

    // Bind move up event.
    $('#periods .period-row:last-of-type .period-move-up').click(function() {
        let me = $(this).parent().parent('.period-row');
        me.prev().before(me);
    });

    // Bind move down event.
    $('#periods .period-row:last-of-type .period-move-down').click(function() {
        let me = $(this).parent().parent('.period-row');
        me.next().after(me);
    });

}

// Time parser function.
function parseTime(time) {

    // Initialize.
    time = time.split(':');
    let result = { h: null, m: null, pm: null };

    // Parse.
    result.h = +time[0] % 12 || 12;
    result.m = +time[1];
    result.pm = +time[0] < 12 ? false : true;

    // Return.
    return result;

}

// Time stringify function.
function stringifyTime(h, m, pm) {
    
    // Initialize.
    let result = '';

    // Fix hours.
    if (pm && h != 12) h += 12;
    if (h < 10) h = '0' + h;
    result += h;

    // Add seperator.
    result += ':';

    // Fix minutes.
    if (m < 10) m = '0' + m;
    result += m;

    // Return.
    return result;

}

// Generation function.
function generate() {

    // Initialize JSON.
    let json = {
        educator: null,
        timezone: null,
        periods: [],
    };

    // Get educator name.
    json.educator = $('.educator-name').val();

    // Get timezone.
    json.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get periods.
    for (let i=0; i<$('.period-row').length; i++) {

        // Initialize variables.
        let periodRow = `.period-row:nth-of-type(${i+1}) `;
        let periodData = { name: null, start: { h: null, m: null, pm: null }, end: { h: null, m: null, pm: null } };

        // Get data.
        periodData.name = $(periodRow+'.period-name').val();
        periodData.start = parseTime($(periodRow+'.period-start').val());
        periodData.end = parseTime($(periodRow+'.period-end').val());

        // Update item.
        json.periods[i] = periodData;
    }

    // Compile component, subase, and base.
    let component = LZString.compressToEncodedURIComponent(JSON.stringify(json));
    let subase = (window.location.hostname == 'sykeben.github.io') ? 'DashReach/' : '';
    let base = `${window.location.protocol}//${window.location.hostname}/${subase}`;

    // Compile normal URL.
    let resultNormalURL = `${base}?raw&source=${component}`;

    // Compile embeddable URL.
    let resultEmbeddableURL = `${base}?embed&raw&source=${component}`;

    // Compile JSON
    let resultJSON = JSON.stringify(json, null, 2);

    // Show results.
    $('#result-url-normal').val(resultNormalURL);
    $('#result-url-embeddable').val(resultEmbeddableURL);
    $('#result-json').text(resultJSON);
    $('#results').removeClass('d-none');

}

// Clipboard copier.
function copy(id) {
    $(`#${id}`).focus();
    $(`#${id}`).select();
    document.execCommand('copy');
}

// Link tester.
function test(id) {
    window.open($(`#${id}`).val(), '_blank');
}

// File saver.
function save(id, fileName) {
    let downloader = document.createElement("a");
    let content = $(`#${id}`).val();
    let file = new Blob([content], {type: 'text/plain'});
    downloader.href = URL.createObjectURL(file);
    downloader.download = fileName;
    downloader.click();
    downloader.remove();
}

// Reset function.
function reset() {

    if (confirm("Resetting the form is irreversible. Your work will be lost.")) {
        window.location.reload();
    }

}

// Initialize page.
window.onload = function() {

    // Load data from URL.
    if (searchParams.has('from')) {

        // Decode & parse JSON.
        let json = JSON.parse(LZString.decompressFromEncodedURIComponent(searchParams.get('from')));
        
        // Load educator name.
        $('.educator-name').val(json.educator);

        // Load periods.
        for (let i=0; i<json.periods.length; i++) {
            let period = json.periods[i];
            appendPeriod(
                period.name,
                stringifyTime(period.start.h, period.start.m, period.start.pm),
                stringifyTime(period.end.h, period.end.m, period.end.pm)
            );
        }

        // Clean out URL.
        window.history.pushState({}, document.title, location.protocol + '//' + location.host + location.pathname);

    // Load initial data.
    } else {

        // Clear educator name.
        $('.educator-name').val("");

        // Create initial period.
        appendPeriod();

    }

    // Prepare JSON example root.
    let subase = (window.location.hostname == 'sykeben.github.io') ? 'DashReach/' : '';
    let base = `${window.location.protocol}//${window.location.hostname}/${subase}`;
    $('#json-example-root').text(base);

}