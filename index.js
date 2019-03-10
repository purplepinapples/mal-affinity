// reduce func helper
function add(accumulator, a) {
    return accumulator + a;
}
// calculate the affinity
function runpearson() {
    var x = [];
    var y = [];
    // for each anime
    $("#changable-example tbody tr").each(function() {
        var vals = [];
        $(this).find('input[type="number"]').each(function() {
            var v = 0;
            v = Number($(this).val());
            // make sure numbers are valid
            if (!(v === 0)) {
                vals.push(v);
            }
        });
        // if we found 2 numbers
        if (vals.length === 2) {
            x.push(vals[0]);
            y.push(vals[1]);
        }
    });

    if (x.length === 0) {
        $("#affinity-calc-target").text("Error: Lulu and Ginko don't have any scored shows in common!");
        return;
    } else if (x.length < 4) {
        $("#affinity-calc-target").text("Error: Lulu and Ginko don't have any enough shows in common!");
        return;
    }

    // adapted from
    // https://github.com/erkghlerngm44/aniffinity/blob/master/aniffinity/calcs.py
    // https://github.com/scipy/scipy/blob/v0.19.1/scipy/stats/stats.py#L2975-L3021
    let mx = x.reduce(add) / x.length;
    let my = y.reduce(add) / y.length;

    let xm = [];
    let ym = [];
    x.forEach(function(el) {
        xm.push(el - mx);
    });
    y.forEach(function(el) {
        ym.push(el - my);
    });

    let sx = [];
    let sy = [];
    xm.forEach(function(el) {
        sx.push(el * el);
    });
    ym.forEach(function(el) {
        sy.push(el * el);
    });

    var numerator = 0;
    for (var i = 0; i < xm.length; i++) {
        numerator += xm[i] * ym[i]
    }

    let denominator = Math.sqrt(sx.reduce(add) * sy.reduce(add));

    if (denominator === 0) {
        if (new Set(x).size === 1) {
            $("#affinity-calc-target").text("Error: All of Lulu's scores can't be the same!");
        } else if (new Set(y).size === 1) {
            $("#affinity-calc-target").text("Error: All of Ginko's scores can't be the same!");
        } else {
            $("#affinity-calc-target").text("Error: undefined")
        }
        return;
    }
    let similarity = (100 * numerator / denominator).toFixed(1);
    $("#affinity-calc-target").text("Affinity: ".concat((similarity > 0) ? "+" : "").concat(similarity.toString()).concat("%"));
}

// adds a row to the editable table
function add_row() {
    $("#changable-example tbody tr:last").after('<tr><td><input class="noborder" type="text" placeholder="anime name..." /></td><td><input type="number" min="1" max="10" placeholder="1-10" /></td><td><input type="number" min="1" max="10" placeholder="1-10" /></td><td class="answer"></td></tr>');
    /* attach function */
    $('#changable-example tbody tr:last input[type="number"]').change(update_diff);
    /* initialize difference */
    $('#changable-example tbody tr:last input[type="number"]').change();
}

// if the affinity has Error, make it red
function errcolor() {
    let has_error = $('#affinity-calc-target:contains("Error")').length
    if (has_error) {
        $("#affinity-calc-target").addClass("err")
    } else {
        $("#affinity-calc-target").removeClass("err")
    }
}

// choose random scores for the 
function randomize_scores() {
    $('#changable-example input[type="number"]').each(function() {
        $(this).val(Math.floor(Math.random() * 10) + 1);
    });
    $("#changable-example tbody tr").each(update_diff);
}

// updates the "score difference" column
function update_diff() {
    var values = [];
    var tr = $(this).closest("tr")
    tr.find('input[type=number]').each(function() {
        values.push(Number($(this).val()));
    });
    for (var i = 0; i < values.length; i++) {
        if (values[i] == 0) {
            tr.find(".answer").first().text("???");
            runpearson();
            errcolor();
            return;
        }
    }
    if (!(Number.isNaN(values[0]) && Number.isNaN(values[1]))) {
        var answer_val = values[0] - values[1];
    }
    answer_val = (answer_val > 0) ? "+".concat(answer_val) : answer_val.toString()
    tr.find(".answer").first().text(answer_val);
    runpearson();
    errcolor();
}

// run when DOM is loaded
function attach_events() {
    /* bind show math button */
    $("#math-button").click(function() {
        $("#math").slideToggle();
        $("math").toggleClass("flex");
    });
    // bind onchange calculate difference
    $('#changable-example input[type="number"]').change(update_diff);
    // initliaze values, incase values are saved in cache
    $('#changable-example tbody tr input[type="number"]:first-child').change();
    // bind add row button
    $("#add-row-button").click(add_row);
    // bind randomize button
    $("#randomize").click(randomize_scores);
}

if (document.addEventListener) document.addEventListener("DOMContentLoaded", attach_events, false);
else if (document.attachEvent) document.attachEvent("onreadystatechange", attach_events);
else window.onload = attach_events;