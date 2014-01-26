var _ = require('underscore');

//var file = [1,4,6,3,7,3,8,4,2,5,2,4,1,1,1,3,4,5,7,4,3,8,6,4,3,5,3,2,3,2,3,2,3,2,1,1,1,1,6,8,7,5,4,4,1,3,45,34,3,2,1,4,6,4,3,6,1,1,1,1,1,1,1,3,3,33,3,3,5,5,6];
//var working_file = [1,4,6,3,7,3,8,4,2,5,2,4,1,1,1,3,4,5,7,4,3,8,6,4,3,5,3,2,3,2,3,2,3,2,1,1,1,1,6,8,7,5,4,4,1,3,45,34,3,2,1,4,6,4,3,6,1,1,1,1,1,1,1,3,3,33,3,3,5,5,6];
//var original_file = [2,2,1,6,5,3,2,5,3,1,8,4,5,4,8,9,5,4,3,4,5,3,2,5,6,7,8,8,8,8,8,8,7,2,4,3,5,21,4,5,3,2,2,2,1,2,3,4,3,2,1,2,4,6,6,7,5,3,7,5,4,1,1,2,1,2,1,2];
//var working_file = 	[2,2,1,6,5,3,2,5,3,1,8,4,5,4,8,9,5,4,3,4,5,3,2,5,6,7,8,8,8,8,8,8,7,2,4,3,5,21,4,5,3,2,2,2,1,2,3,4,3,2,1,2,4,6,6,7,5,3,7,5,4,1,1,2,1,2,1,2];
var pairs = [];
var replacements = [];

original_file = [];
working_file = [];

var total_elements = 300; 
var element_variation = 15;

/* Generate random pair file */
for (var i = total_elements - 1; i >= 0; i--) {
	var rand = getRandomInt(1,element_variation);
	original_file.push(rand);
	working_file.push(rand);
};

var next_symbol = max_symbol();
console.log("Start. next symbol: "+next_symbol);

function scan_pairs(){
	pairs = [];
	for (var i = 0; i < working_file.length; i++) {
		if(working_file[i+1] === undefined){
			return;
		}

		var pair_hash = working_file[i]+','+working_file[i+1];
		
		// var sch_start = Date.now();
		// indexSearch(pairs,"key",pair_hash);
		// var sch_end = Date.now();
		// time_sch += sch_end-sch_start;

		if(indexSearch(pairs,"key",pair_hash) === undefined){
			
			pairs.push({
				key: pair_hash,
				elements: [working_file[i],working_file[i+1]],
				locations: [i]
			});

		}else{
			//var sch_start = Date.now();
			pairs[indexSearch(pairs,"key",pair_hash)].locations.push(i);
			//var sch_end = Date.now();
			//time_sch += sch_end-sch_start;
		}
	};
}

function pair_replace(){
	var replacing_pair = pairs.pop();
	if(replacing_pair == undefined || !replacing_pair.locations.length){
		return;
	}

	var replacing_sym = get_next_symbol();
	replacements.push({
		pair: replacing_pair.key,
		elements: replacing_pair.elements,
		symbol: replacing_sym,
		count: replacing_pair.locations.length
	});

	var skip_indexes = [];
	_.each(replacing_pair.locations,function(loc){
		if(!_.find(skip_indexes,function(pos){ return pos == loc; })){
			working_file[loc] = replacing_sym;
			working_file[loc+1] = 0;
			if(_.find(replacing_pair.locations,function(pos){ return pos == loc+1; })){
				skip_indexes.push(loc+1);
			}
		}
	});
}

function reconstruct(replacements){
	var rec_file = [_.last(replacements).symbol];
	while(replacements.length){
		var rep = replacements.pop();
		while(_.contains(rec_file,rep.symbol)){
			_.each(rec_file,function(ele,idx){
				if(ele == rep.symbol){
					rec_file[idx] = rep.elements[0];
					rec_file.splice(idx+1,0,rep.elements[1]);
				}
			});
		}
	}
	return rec_file;
}

/* Main Process */
var first_run = true;
var iteration = 0;

var time_scan = 0;
var time_sort = 0;
var time_replace = 0;
var time_prune = 0;

var time_sch = 0;

var time_start = Date.now();
while(pairs.length > 0 || first_run){
	if(first_run){
		first_run = false;
	}
	iteration++;

	/* scan for pairs */
	var scan_time_start = Date.now();
	scan_pairs();
	var scan_time_stop = Date.now();
	time_scan += scan_time_stop-scan_time_start;
	//console.log("time scan: "+(scan_time_stop-scan_time_start));


	/* sort pairs by most frequest occurence */
	var sort_time_start = Date.now();
	pairs = _(pairs).sortBy(function(p){ return p.locations.length; });
	var sort_time_stop = Date.now();
	//console.log("time sort: "+(sort_time_stop-sort_time_start));
	time_sort += sort_time_stop-sort_time_start;

	/* replace occurence with new symbol */
	var rep_time_start = Date.now();
	pair_replace();
	var rep_time_stop = Date.now();
	time_replace += rep_time_stop-rep_time_start;

	/* remove holes made by replacement */
	var prune_time_start = Date.now();
	prune_zeros();
	var prune_time_stop = Date.now();
	time_prune += prune_time_stop-prune_time_start;
	//console.log(working_file);
}
var time_stop = Date.now();

//console.log("Pairs:");
//console.log(replacements);

/* Reconstruct File */
var recon_time_start = Date.now();
var recon_file = reconstruct(replacements);
var recon_time_stop = Date.now();



//console.log(recon_file);
//console.log(original_file);
//console.log('Original File: '+original_file.length+" elements long.");
//console.log('Reconstructed File: '+recon_file.length+" elements long.");
console.log("");
console.log("Elements in Set: "+total_elements+" Variation: "+element_variation);
console.log("Runtime Build: "+(time_stop-time_start)+"ms");
console.log("Runtime Recon: "+(recon_time_stop-recon_time_start)+"ms");
console.log("");
console.log("Time Scan: "+time_scan+"ms - "+(time_scan/(time_stop-time_start)*100).toFixed(2)+"%");
console.log("Time Sort: "+time_sort+"ms - "+(time_sort/(time_stop-time_start)*100).toFixed(2)+"%");
console.log("Time Replace: "+time_replace+"ms - "+(time_replace/(time_stop-time_start)*100).toFixed(2)+"%");
console.log("Time Prune: "+time_prune+"ms - "+(time_prune/(time_stop-time_start)*100).toFixed(2)+"%");
//console.log("Time Sch?: "+time_sch+"ms - "+(time_sch/(time_stop-time_start)*100).toFixed(2)+"%");
console.log("");

if(files_same(recon_file,original_file)){
	console.log("Result: Reconstruct Match.");
}else{
	console.log("Result: Error.")
}


/*
	Utility functions
*/
function get_next_symbol(){
	next_symbol++;
	return next_symbol-1;
}
function max_symbol(){
	return _.max(original_file,function(f){ return f; })+1;
}
function prune_zeros(){
	working_file = _.without(working_file,0);
}
function pairHash(left,right){
	return left+","+right;
}
function indexSearch(arr,key,val){
	for (var i = 0; i < arr.length; i++){
		if(arr[i][key] === val){
			return i;
		}
	}
	return undefined;
}
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function files_same(f1,f2){
	for (var i = 0; i < f1.length; i++){
		if(f1[i] !== f2[i]){
			console.log("ELEMENT "+i+" F1: "+f1[i]+" F2: "+f2[i]);
			return false;
		}
	}
	return true;
}