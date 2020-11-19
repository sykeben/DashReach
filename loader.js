// Get URL parameters.
var searchParams = new URLSearchParams(window.location.search);

// Change data source.
let isRaw = searchParams.has('raw');
let dataSource;
if (searchParams.has('source')) {
    if (isRaw) {
        dataSource = JSON.parse(LZString.decompressFromEncodedURIComponent(searchParams.get('source')));
    } else {
        dataSource = decodeURI(searchParams.get('source'));
    }
} else {
    dataSource = 'data.json';
}

// Change embedded specifics. 
if (searchParams.has('embed')) {
    $('.embed-exempt').addClass('d-none');
    $('.embed-include').removeClass('d-none');
} else {
    $('.embed-include').addClass('d-none');
}

// Update function.
function updateData(json) {

    // Display educator information.
    $('#educator').text(json.educator);

    // Display timezone.
    $('#timezone').text(json.timezone.replace(/_/g, ' ').replace(/\//g, ', '));

    // Construct period list.
    for (let period of json.periods) {

        // Preformat minutes.
        startM = period.start.m < 10 ? '0' + period.start.m : period.start.m;
        endM = period.end.m < 10 ? '0' + period.end.m : period.end.m;

        // Preformat suffixes.
        startPM = period.start.pm ? 'PM' : 'AM';
        endPM = period.end.pm ? 'PM' : 'AM';

        // Append to table.
        $('#periods').append(`<tr>

                <th class="pt-3" scope="row">
                    <h3 class="py-0 py-md-1 py-lg-2">${period.name}</h3>
                </th>

                <td class="align-middle">
                    <h4>${period.start.h}:${startM} <small class="d-none d-md-inline">${startPM}</small></h4>
                </td>

                <td class="align-middle">
                    <h4>${period.end.h}:${endM} <small class="d-none d-md-inline">${endPM}</small></h4>
                </td>

            </div>
        </tr>`);

    }

    // Update creator link.
    $('#create-link').attr('href', `${$('#create-link').attr('href')}?from=${LZString.compressToEncodedURIComponent(JSON.stringify(json))}`);

}

// Initialize page.
window.onload = function() {
    
    // Load data from URL.
    if (isRaw) {

        // Update dash.
        updateData(dataSource);
        

    // Load data from file.
    } else {

        // Update dash.
        $.getJSON(dataSource, updateData);

    }
}