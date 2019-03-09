// Download kurviger maps - 2nd step
var mapList = [], folders2Read, regionFld = [], map_ex, map_root_page, parse_root_page, browserFile, 
xmlHttpReq = new XMLHttpRequest(), null_date = new Date('2200-01-01T00:00:00.000Z');

function requestNextFolder() {
	if( folders2Read.length > 0)	 { // still folders to read
		xmlHttpReq.open("GET", parse_root_page + folders2Read[0] + browserFile, true);
		xmlHttpReq.responseType = "text";
		xmlHttpReq.onreadystatechange = folderHtmlRx;
		xmlHttpReq.send(null);
	} else { // all folders read
		buildTable();
	}
}

function folderHtmlRx(e) {
	var htmlTxt, furtherFld, fldMaps, re, re_res, k;
	if (xmlHttpReq.readyState == 4) {
		if( xmlHttpReq.status == 200 ) {
			// console.log('Folder Rx: "' + folders2Read[0] + '"' );
			htmlTxt = xmlHttpReq.responseText;
			
			// Folder link:
			// <tr><td valign="top"><img src="/icons/folder.gif" alt="[DIR]"></td><td><a href="africa/">africa/</a></td><td align="right">2019-02-07 05:38  </td><td align="right">  - </td><td>&nbsp;</td></tr>
			furtherFld = htmlTxt.match( /href="[a-z\-]+\/"/gi ); // trailing '/' -> folder
			
			if(furtherFld) {
				furtherFld.reverse().forEach( function (fld) {
					folders2Read.splice( 1, 0, (folders2Read[0] + '/' + fld.slice(6, -2) ) ); // add folders to list, cut leading 'href="', cut trailing '/"'
				});
			}
			
			if( folders2Read[0].length > 0 ) { // not empty -> not in root
				if(furtherFld) {
					// console.log('Add region folder : "' + folders2Read[0] + '"' );
					regionFld.push( folders2Read[0] );
				}
				// console.log('Add region folder : "' + folders2Read[0] + '/*.map"' );
				regionFld.push( folders2Read[0] + '/*.map' );
				
				// map links
				// <tr><td valign="top"><img src="/icons/unknown.gif" alt="[   ]"></td><td><a href="seychelles.map">seychelles.map</a></td><td align="right">2019-02-07 03:22  </td><td align="right"> 16M</td><td>&nbsp;</td></tr>
				//      <td><a href="seychelles.map">seychelles.map</a></td><td align="right">2019-02-07 03:22  </td><td align="right"> 16M</td>
				re = /<td><a\s+href="([^"]+)\.map">[^<>]*<\/a><\/td><td[^>]*>\s*(\d[\d\-\: ]*\d)\s*<\/td><td[^>]*>\s*(\S[^<]*\S)\s*<\/td>/g;
				var re_res;
				while ((re_res = re.exec(htmlTxt)) !== null) {
					mapList.push( folders2Read[0] + '/' + re_res[1] 	);
					mapList.push(re_res[2]);
					mapList.push(re_res[3]);
				}
			}
			
			folders2Read.shift(); // remove 1st entry
			
			requestNextFolder();
		}
	}	
}


function downLoad() {
	var k, cb, map, td;
	
	for( k=0; k<mapList.length; k+=3) {
		map = mapList[k].slice(1);
		// console.log( 'Now: ' + map );
		cb = document.getElementById(map);
		if( cb.checked && window.getComputedStyle(cb.parentElement.parentElement).display !== 'none' ) { // download only if checked and tr containing checkbox visible
			window.open( map_root_page + map + map_ext ); // start download
			setCookie( 'downLoadMaps.' + map, (new Date( mapList[k+1] )).toISOString() );
			cb.checked = false;
			td = cb.parentElement.previousElementSibling;
			td.innerHTML = (new Date( mapList[k+1] )).toLocaleString();
			cb = createElemAndAppend( 'button', td, [ 'id', 'ign.' + map, 'onclick', 'ignoreMap(this)' ] );
			cb.innerHTML = 'CLR';
			window.setTimeout(downLoad, 5e3); // start next download in x milliseconds (delay improves stabilty)
			break;
		}
	}
}

function bodyLoaded() {
	if ( window.location.hostname.includes('kurviger') ) { // running on kurviger
		parse_root_page = 'https://offline-maps.kurviger.de/';
		browserFile = '';
		map_root_page = parse_root_page;
		map_ext = '.map';
	} else {
		document.getElementById('cookieLink').style.display = null; // remove 'none'
		parse_root_page = '/mate/kurviger/maps/';
		browserFile = '/download.html';
		if (cookieSwi('downLoadMaps.realDownLoad')) {
			map_root_page = 'https://offline-maps.kurviger.de/';
			map_ext = '.map';
		} else {
			map_root_page = parse_root_page;
			map_ext = '.php';
		}
	}
	showRegions();
	folders2Read = ['']; // empty string -> start in download root folder
	requestNextFolder();
}

function buildTable() {
	var tabMaps = document.getElementById('tabMaps'), tr, td, cb, dnDate, now = new Date(), flagCheck, map_array = [], k, cn,
	tabRegionFolders = document.getElementById('tabRegionFolders');
	
	// console.log(mapList);
	
	// build array with map name and download date
	for( k=0	; k<mapList.length; k +=3) {
		cn = 'downLoadMaps.' + mapList[k].slice(1); // cookie name
		map_array.push( { map: mapList[k].slice(1),
			date_map: new Date( mapList[k+1] ),
			size: mapList[k+2],
			date: (cookieExist(cn) ? (new Date(getCookie(cn))) : null_date)
		} );
	}
	
	
	// sort array
	map_array.sort( function (a, b) {
		if( a.date > b.date) {
			return 1;
		} else {
			if( a.date < b.date) {
				return -1;
			} else {
				return 0;
			}
		}
	});
	
	// add table rows concerning to sorted array
	map_array.forEach(function (map) {
		var tr, td, cb, css;
		
		// console.log( 'class="' + class_txt + '"' );
		tr = createElemAndAppend( 'tr', tabMaps, [ 'class', getClassTxt( map.map, true ) ] ); // table row in body
		td = createElemAndAppend( 'td', tr, [] ); // map name column
		td.innerHTML = map.map;
		
		td = createElemAndAppend( 'td', tr, [] ); // server update column
		td.innerHTML = map.date_map.toLocaleString();
		
		td = createElemAndAppend( 'td', tr, [] ); // map size column
		td.innerHTML = map.size;
		
		td = createElemAndAppend( 'td', tr, [] ); // local update column
		if (map.date != null_date) {
			td.innerHTML = map.date.toLocaleString();
			cb = createElemAndAppend( 'button', td, [ 'id', 'ign.' + map.map, 'onclick', 'ignoreMap(this)' ] );
			cb.innerHTML = 'CLR';
		} else {
			td.innerHTML = '-';
		}
		
		td = createElemAndAppend( 'td', tr, [] ); // checkbox 'now' column
		cb = createElemAndAppend( 'input', td, [ 'type', 'checkbox', 'id', map.map ] );
		
		// flagCheck = ( map.date != null_date && now - map.date > 30*24*36e5  ); // >30 days ?
		flagCheck = ( map.date != null_date && Math.abs(map.date_map.getTime() - map.date.getTime()) >= 1e3 ); // update > last download ?
		if(flagCheck) {
			cb.checked = true;
		}
	});
	
	// add table rows concerning to region folder  array
	// console.log(regionFld);
	regionFld.forEach(function (rFld1) {
		var rFld = rFld1.slice(1), rFldDash = rFld.replace(/\/(\*\.)?/g,'-'),
		css = createElemAndAppend( 'style', document.body, [ 'id', rFldDash ] ), // 1st table cell in row
		flagCheck = cookieSwi( 'downLoadMaps.show.' + rFldDash, true);
		
		css.innerHTML = styleText( rFldDash, flagCheck);
		// console.log(styleText( rFldDash, flagCheck));
		
		tr = createElemAndAppend( 'tr', tabRegionFolders, [ 'class', getClassTxt( rFld, false ) + ' region' ] ); // table row in body
		td = createElemAndAppend( 'td', tr, [] ); // 1st table cell in row
		td.innerHTML = rFld;
		
		td = createElemAndAppend( 'td', tr, [] ); // 5th table cell in row
		cb = createElemAndAppend( 'input', td, [ 'type', 'checkbox', 'id', 'cbRegionFld' + rFldDash, 'onchange', 'regionCbChanged(this)' ] );
		
		cb.checked = flagCheck;
	});
}

function styleText( classTxt, flagVis) {
	return flagVis ? '' : ( '.' + classTxt + ' { display:none; }' ); // empty style if visible
}

function showRegions(flagShow) {
	if(typeof flagShow == 'undefined') {
		flagShow = cookieSwi( 'downLoadMaps.showRegions', true );
	}
	document.getElementById('styleRegion').innerHTML = flagShow ? '' : '.region {display:none;}';
	document.getElementById('showRegions').style.display = flagShow ? 'none' :null;
	setCookie( 'downLoadMaps.showRegions', flagShow ); 
}

function getClassTxt( map_path, flagAddMaps ) {
	var map_path_fld = map_path.split('/'), class_path = '', k, class_txt = '';
	
	for ( k = 0; k < map_path_fld.length-1; k++ ) {
		class_path += '-' + map_path_fld[k];
		class_txt += ' ' + class_path.slice(1); // cut leading '-'
	}
	if( flagAddMaps ) {
		class_txt += ' ' + class_path.slice(1) + '-map'; // cut leading '-'
	} else {
		//class_txt = class_txt.replace(/\-maps$/, '');
	}
	return class_txt.slice(1); // cut leading ' '
}


function regionCbChanged(cb) {
	var region = cb.id.slice(11); //cut leading 'cbRegionFld'
	document.getElementById(region).innerHTML = styleText( region, cb.checked);
	setCookie( 'downLoadMaps.show.' + region, cb.checked ); 
}

function ignoreMap(btn) {
	// console.log(btn.id);
	delCookie( 'downLoadMaps.' + btn.id.slice(4) );	// cut leading 'ign.'
	btn.parentElement.innerHTML = '-';	
}

//======================================================================================
function createElemAndAppend( type, par, attrib_list ) {
	var elem = document.createElement(type), k;
	par.appendChild(elem);
	
	if ( typeof attrib_list != 'undefined' ) {
		for ( k=0; k < attrib_list.length;	 k+=2 ) {
			elem.setAttribute( attrib_list[k], attrib_list[k+1] );
		}
	}
	return elem;
}
