var selected_label = null;
var selected_label_color = null;
var wavesurfer; // eslint-disable-line no-var

function toggleIcon(button){
    $(button).find('i').remove();
    if (wavesurfer.backend.isPaused()) {
        $(button).html($('<i/>',{class:'fas fa-play'})).append(' Play');
    }
    else {
        $(button).html($('<i/>',{class:'fas fa-pause'})).append(' Pause');
    }
}

function selectedLabel(button) {

    if(selected_label == button) {
        selected_label.style.border = 'none';
        selected_label.style.background = selected_label_color;
        selected_label = null;
        selected_label_color = null;
        // if no label is selected user cannot drag
        wavesurfer.disableDragSelection();
    } else {
        // if label already selected, unselect it
        if(selected_label) {
            selected_label.style.border = 'none';
            selected_label.style.background = selected_label_color;
        }

        // set new selected label
        selected_label = button;
        selected_label_color = button.style.backgroundColor;
        
        // enable drag selection with label's color
        wavesurfer.enableDragSelection({
            color: rgbToRgba(selected_label_color)
        });
        button.style.border = '2px solid #74deed';
        button.style.background = 'grey'
    }
}

// rgb to rgba with opacity 0.1
function rgbToRgba(rgb) {
    if(rgb.indexOf('a') == -1){
        var rgba = rgb.replace(')', ', 0.5)').replace('rgb', 'rgba');
    }
    return rgba;
}
//----------------------------------------------------------------------------------------------



document.addEventListener('DOMContentLoaded', function() {
    // Init wavesurfer
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height: 200,
        pixelRatio: 1,
        scrollParent: true,
        normalize: true,
        minimap: true,
        backend: 'MediaElement',
        plugins: [
            WaveSurfer.regions.create(),
            WaveSurfer.minimap.create({
                height: 30,
                waveColor: '#ddd',
                progressColor: '#74deed',
                cursorColor: '#999'
            }),
            WaveSurfer.timeline.create({
                container: '#wave-timeline'
            })
        ]
    });
    wavesurfer.load(audio_url);

    /* Regions */

    // load regions of existing annotation (if exists)
    wavesurfer.on('ready', function() {
        result = annotation['result']
        // if there is a result load regions of annotation
        if(result && result.length != 0) {
            loadRegions(result);
        }
    });

    
    // on region click
    wavesurfer.on('region-click', function(region) {
        //alert(region.start);
    });

    
    // on region created set its data to current label
    wavesurfer.on('region-created', function(region) {
        if(selected_label) {
            region.data['label'] = selected_label.value;
            region.data['color'] = selected_label_color;
        }
    });

    // play regions
    // wavesurfer.on('region-click', function(region, e) {
        
    //     e.stopPropagation();
    //     // Play on click, loop on shift click
    //     e.shiftKey ? region.playLoop() : region.play();
    // });
    
    // // when region plays, take audio to the beggining of the region
    // wavesurfer.on('region-play', function(region) {
    //     region.once('out', function() {
    //         wavesurfer.play(region.start);
    //         wavesurfer.pause();
    //     });
    // });

});


function createResult() {
    // annotation result will be an array of dictionaries
    // each dict will represent a region
    let result = [];
    Object.keys(wavesurfer.regions.list).map(function(id) {
        let region = wavesurfer.regions.list[id];
        let region_dict = {
            "audio_length": wavesurfer.getDuration(),
            "value": {
                "start": region.start,
                "end": region.end,
                "label": region.data['label'],
                "color": region.data['color']
            }
        }
        result.push(region_dict);
    })
    return result;
}


function submitAnnotation() {
    // xmlhttp request for saving the annotation
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
            const response = JSON.parse(this.responseText);
            alert(response['message']);
        } else if(this.readyState == 4 && (this.status == 400 || this.status == 401)){
            const response = JSON.parse(this.responseText);
            alert(response['message']);
        }
    };
    let url = "http://127.0.0.1:8000/api/v1/projects/" + project_id + "/tasks/" + task_id + "/annotation/save";
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("X-CSRFToken", django_csrf_token);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(createResult()));
}


//Load regions from annotation.
function loadRegions(result) {
    for(const region of result) {
        let new_region = wavesurfer.addRegion({
            "start": region['value']['start'],
            "end": region['value']['end'],
            "color": rgbToRgba(region['value']['color'])
        });
        new_region.data['label'] = region['value']['label'];
        new_region.data['color'] = region['value']['color'];
    }
}