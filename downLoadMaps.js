var mapList = [], folders2Read, map_ex, map_root_page, browserFile, xmlHttpReq = new XMLHttpRequest();
// Download kurviger maps - 1st step

null_date = new Date('2200-01-01T00:00:00.000Z');

if ( window.location.hostname.includes('kurviger') ) { // running on kurviger
	map_root_page = 'https://offline-maps.kurviger.de/';
	map_ext = '.map';
	browserFile = '';
} else {
	map_root_page = '/mate/kurviger/maps/';
	map_ext = '.php';
	browserFile = '/download.html';
}

function requestNextFolder() {
	if( folders2Read.length > 0)	 { // still folders to read
		xmlHttpReq.open("GET", map_root_page + folders2Read[0] + browserFile, true);
		xmlHttpReq.responseType = "text";
		xmlHttpReq.onreadystatechange = folderHtmlRx;
		xmlHttpReq.send(null);
	} else { // all folders read
		buildTable();
	}
}

function folderHtmlRx(e) {
	var htmlTxt, furtherFld, fldMaps, re, re_res;
	if (xmlHttpReq.readyState == 4) {
		if( xmlHttpReq.status == 200 ) {
			htmlTxt = xmlHttpReq.responseText;
			
			// Folder link:
			// <tr><td valign="top"><img src="/icons/folder.gif" alt="[DIR]"></td><td><a href="africa/">africa/</a></td><td align="right">2019-02-07 05:38  </td><td align="right">  - </td><td>&nbsp;</td></tr>
			furtherFld = htmlTxt.match( /href="[a-z\-]+\/"/gi ); // trailing '/' -> folder
			
			if(furtherFld) {
				furtherFld.forEach( function (fld) {
					folders2Read.push( folders2Read[0] + '/' + fld.slice(6, -2)); // add folders to list, cut leading 'href="', cut trailing '/"'
				});
			}
			
			if( folders2Read[0].length == 0 ) { // empty -> root
				rootFld = JSON.parse(JSON.stringify(folders2Read));
				rootFld.shift();
			} else { // not empty -> not in root
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
	var k, cb, map;
	
	for( k=0; k<mapList.length; k+=3) {
		map = mapList[k].slice(1);
		console.log( 'Now: ' + map );
		cb = document.getElementById(map);
		if( cb.checked ) {
			cb.checked = false;
			setCookie( 'downLoadMaps.' + map, (new Date( mapList[k+1] )).toISOString() );
			window.open( map_root_page + map + map_ext ); // start download
		}
	}
}

function bodyLoaded() {
	folders2Read = ['']; // empty sring -> start in root
	requestNextFolder( map_root_page );
}

function buildTable() {
	var tabMaps = document.getElementById('tabMaps'), tr, td, cb, dnDate, now = new Date(), flagCheck, map_array = [], k, cn,
		tabRootFolders = document.getElementById('tabRootFolders');

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
		tr = createElemAndAppend( 'tr', tabMaps, [] ); // table row in body
		td = createElemAndAppend( 'td', tr, [] ); // 1st table cell in row
		td.innerHTML = map.map;
		
		td = createElemAndAppend( 'td', tr, [] ); // 2nd table cell in row
		td.innerHTML = map.date_map.toLocaleString();
		
		td = createElemAndAppend( 'td', tr, [] ); // 3rd table cell in row
		td.innerHTML = map.size;

		td = createElemAndAppend( 'td', tr, [] ); // 4th table cell in row
		td.innerHTML = map.date != null_date ? map.date.toLocaleString() : '-';
		
		td = createElemAndAppend( 'td', tr, [] ); // 5th table cell in row
		cb = createElemAndAppend( 'input', td, [ 'type', 'checkbox', 'id', map.map ] );
		
		// flagCheck = ( map.date != null_date && now - map.date > 30*24*36e5  ); // >30 days ?
		flagCheck = ( map.date != null_date && map.date_map > map.date ); // update > last download ?
		if(flagCheck) {
			cb.checked = true;
		}
	});

	// add table rows concerning to root folder  array
	// console.log(rootFld);
	// rootFld.forEach(function (rFld1) {
		// rFld = rFld1.slice(1);
		// tr = createElemAndAppend( 'tr', tabRootFolders, [ 'class', 'rootFld' + rFld ] ); // table row in body
		// td = createElemAndAppend( 'td', tr, [] ); // 1st table cell in row
		// td.innerHTML = rFld;
		
		// td = createElemAndAppend( 'td', tr, [] ); // 5th table cell in row
		// cb = createElemAndAppend( 'input', td, [ 'type', 'checkbox', 'id', 'cbRootFld' + rFld ] );
		
		// // flagCheck = ( map.date != null_date && now - map.date > 30*24*36e5  ); // >30 days ?
		// flagCheck = true; // todo: read from cookie
		// if(flagCheck) {
			// cb.checked = true;
		// }
	// });
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
