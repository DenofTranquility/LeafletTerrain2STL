# Leaflet Terrain2STL

## Intro
This fork is based off of [jthatch's awesome work](https://jhatch.com) creating a program to take an area of the world and generate a STL file for download and use with a 3D printer.

It uses SRTM data which comes from the [shuttle mission](https://www2.jpl.nasa.gov/srtm/) of 2000.
The original elevation data was captured by the space shuttle on it's orbit around the globe and was saved in a dataset called SRTM. The files within this set are hgt files. The mission was limited to 66° latitude so data near to the poles was missed. The data captured was good to a resolution of 90m. In recent times more data has been captured from satellites using Synthetic Aperture Radio(SAR) and has a higher resolution. The full globe hasn't been done so some areas will still be of a lower resolution.

**From [OSM Wiki](https://wiki.openstreetmap.org/wiki/SRTM)**
>The official 3-arc-second and 1-arc-second data for versions 2.1 and 3.0 are divided into 1°×1° data tiles. The tiles are distributed as zip files containing HGT files labeled with the coordinate of the southwest cell. For example, the file N20E100.hgt contains data from 20°N to 21°N and from 100°E to 101°E inclusive.

>The HGT files have a very simple format. Each file is a series of 16-bit integers giving the height of each cell in meters arranged from west to east and then north to south. Each 3-arc-second data tile has 1442401 integers representing a 1201×1201 grid, while each 1-arc-second data tile has 12967201 integers representing a 3601×3601 grid. The outermost rows and columns of each tile overlap with the corresponding rows and columns of adjacent tiles.


Different countries also have their own dedicated LiDAR programs and so the [UK](https://environment.data.gov.uk/DefraDataDownload/?Mode=survey) for instance has data with a resolution of <1m in certain areas. [Italy](http://tinitaly.pi.ingv.it/) has data of 10m resolution. The LiDAR data requires extra processing as it comes in a point cloud and at a present I have not looked at a way to process it other than within [QGIS](https://www.qgis.org/en/site/).
There are also no easy ways to bulk download most of the data and if there were the datasets would probably end up being at least a terabytes worth.

There is the Earth Engine by Google which provides an API for access to the SRTM datasets and maybe more, it is also used by touch terrain. As far as I can see it is free to use and only an account is needed.

## Code
The frontend is written in HTML and Javascript.I have ported the basic functionality of the nodeJS server to PHP so if you are running Wordpress or something else relying on PHP it should work.

The styling uses Bootstrap 5 because it's quick to get set up and looks semi decent.

I didn't want to use Google as the map provider and instead went for [OpenStreetMaps](https://www.openstreetmap.org), I found a good lightweight library called [leafletjs](https://lealfletjs.com). This led me to a lot of issues as the code is designed for use with Googles API, I originally kept everything the same and only changed what was necessary to get the map working with all the original code. Eventually I decided that having more control over the rectangle was necessary.

I included three modules, [Leaflet-Editable](http://leaflet.github.io/Leaflet.Editable/), [Leaflet Path drag](https://github.com/Leaflet/Path.Drag.js) and [Leaflet Control Geocoder](https://github.com/perliedman/leaflet-control-geocoder/releases). The first two are required for drawing shapes and paths and moving them about and the geocoder adds search functionality.

A feature I implemented is that of maintaining an aspect ratio of 4:3 so that it fits my print bed nicely(*Selfish...I know* :D). At the moment this is hardcoded but could be changed in the future.

The map tiles I am using from [Stamen](http://maps.stamen.com/#terrain/12/37.7706/-122.3782) they allow using terrain tiles for free and also have other options for tiles.

I struggled to get the XHR to work properly and so had to change that to use FormData instead. I used code from [Simon Plend's Blog](https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/) which helped tremendously.

## Resources

There are several sites containing similar functionality and also datasets.

  - https://github.com/ThatcherC/Terrain2STL
  Has a great site with conversion from a rectangle on map to STL file. Used some code from  his repository. Will probably fork it to my own.

  - https://touchterrain.geol.iastate.edu/
  Does the same as Terrain2STL with more customisation options and the ability to choose which dataset to create a STL from.
  The code is written in Python and the repository can be found at:
  https://github.com/ChHarding/TouchTerrain_for_CAGEO

  - https://terrainator.com/
  Does the same as Terrain2STL and isn't as easy to use. They also charge for the release of the STL file and/or the file is sent to Shapeways to be printed for you.

  - http://viewfinderpanoramas.org/
  Based in the UK and has the datasets of pretty much the world. There isn't a bulk download option however a list of all the zip files can be generated from the search area. Using this I downloaded all the HGT data.

  - https://opendem.info/
  Contains a lot of useful information regarding elevation data and also a handy calculator for arc-seconds and metres. It also has links to datasets around the world.


## Equations and Formulas

1 degree **°** = 60 arc minutes **'**
1 arc minute **'** = 60 arc seconds **''**
1 arc second **''** at equatorial sea level = 1852m
= 30.86666667m

**Formula**:
cos(degree latitude) * (1852/60)

  ***Examples:***
  1. `0° latitude and 1 arc second: cos(0)  * 30.866666667 = 1 * 30.866666667
  = 30.866666667`
  2. `45° latitude and 1 arc second: cos(45) * 30.866666667 = 0.7071067811865476 * 30.866666667 = 21.82602931286047`
  3. `60° latitude and 1 arc second: cos(60) * 30.866666667 = 0.5000000000000001 * 30.866666667 = 15.433333333500004`

**Haversine Formula**

Used to determine how much the value of the latitude south and/or longitude east should be adjusted by. The Earths circumference is used however this is based on a sphere whereas the Earth is slightly ellipsoid. In this instance using the value below will be sufficient. As we get nearer to the poles; the circumference of the Earth shortens.

To determine the new point  **d**(distance) in kilometres:

**Latitude = 360 * d / C**

**Longitude = 360 * d / (C*cos(latitude))**

```js
  const C = 40075.04; //Circumference of the earth in km
  var d; //Point at distance in kilometres.
  var latitude = Math.min(Math.max(parseFloat(document.getElementById('c-lat').value),-69),69)
  var latFormula = 360*d/C; //degrees
  var lonFormula = 360*d/(C*Math.cos(latitude)); //degrees
```
## To Do
- [ ] Un-Hardcode aspect ratio
- [ ] Move rectangle to view when a place is searched and panned to.
- [ ] Calculate metres to arc-seconds.
- [ ] Fix the area not exactly matching.
- [ ] Some bits and bobs I've broken
- [ ] Add sanitisation to the exec command in PHP

### Terrain2STL Generate STL File Usage
#### *Taken from Terrain2STL github instructions*
**Install**

Build the STL generator program with a simple make:

`you@comp:~/.../Terrain2STL$ make`
If that's successful, generate a test STL with

`./celevstl 44.1928 -69.0851 40 40 1.7 0 1 3 1 test.stl`

and you should be treated with a model of scenic Rockport harbor!

The arguments here are:
```
    Northwest corner latitude
    Northwest corner longitude
    Model width ("pixels")
    Model height ("pixels")
    Vertical scaling factor
    Rotation angle (degrees)
    Water drop (mm) (how much the ocean should be lowered in models)
    Base height (mm) (how much extra height to add to the base of model)
    Step size (hgt cells per model pixel)
    Output file name
```
