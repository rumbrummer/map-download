# map-download
Download manager for kurviger offline maps
- implement with HTML, CSS ans JS
- Read info about available maps from kurviger download page https://offline-maps.kurviger.de/
- show a table with checkboxes to select available regions
- selection of regions is stored / initilized via cookies
- show a table with checkboxes to select available maps for download
- User can select desired downloads and press a "Run" button, which starts download of all selected maps
- Information about downloaded maps ( Last update of map on kurviger server, download page ) is stored in cookies
- no cookie for a map -> not yet downloaded
- table will be sorted:
    - map, whose last update on kurviger server in newer than last local download (local version not up to date ), -> Group 1
    - followed by maps, which have been downloaded,but are up to date, -> Group 2
    - followed by further available maps, -> Group 3
    - inside groups 1-3 sorted alphabetically
- checkbox "download now" will be initially set for group 1, unset for group 2 + 3 
