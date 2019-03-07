# map-download
Download manager for kurviger offline maps
- implement with HTML, CSS ans JS
- Read info about available maps from kurviger download page https://offline-maps.kurviger.de/
- Set up a table with available maps:
     - column 1: Name of map (incl. path)
     - column 2: Last update of map on kurviger server (download page)
     - column 3: Update-date of map on kurviger server during last local download download ('-' if not yet downloaded )
     - column 4: checkbox to select for download
- User can select desired downloads and press a "Run" button, which starts download of all selected maps
- Information about downloaded maps ( Last update of map on kurviger server, download page ) is stored in cookie
- no cookie for a map -> not yet downloaded
- table will be sorted:
    - map, whose last update on kurviger server in newer than last local download (local version not up to date ), ->Group 1
    - followed by maps, which have been downloaded,but are up to date, ->Group 2
    - followed by further available maps, ->Group 3
    - inside groups 1-3 sorted alphabetically
- checkbox in column 4 will be inially set for group 1, unset for group 2 + 3 

1st step:
- read https://offline-maps.kurviger.de/ via XmlHttpRequest
- parse result for links to sub folders
- show those sub-folders
- expected result:
      africa
      asia
      australia-oceania
      central-america
      europe
      north-america
      russia
      south-america
