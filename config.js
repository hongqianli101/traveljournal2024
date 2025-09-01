let topTitleDiv = "<h4></h4>";

let titleDiv = "<h1>A Year in Motion: My 2024 Travel Map</h1>";

let bylineDiv = "<p>By Hongqian Li</p>";

let descriptionDiv =
  "<p>This data journal draws on the geotags of my iPhone photos from 2024, organized by day, to figure out what these digital breadcrumbs can really tell us about our mobility patterns, habits, our favorite spots, and even maybe the boundaries we set for ourselves without realizing it.</p>"+
  '<p style="text-align:center">' +
  '<img src="data/Manhattan.png" alt="Scroll arrow" style="width:200px;" />' +
  '</p>' +
  '<p style="text-align:center">Scroll to continue<br>▼</p>';

let footerDiv =
  '<p></p>' ;

let divChapter1 =
  "<h3>Can you guess where I lived in 2024?</h3>" +
  "<p>To protect privacy, all spatial points within a 400-meter radius of my apartment were removed from the dataset. This also served as a data cleaning step, eliminating a dense cluster that might have skewed the analysis. By removing that static home cluster, the focus shifts entirely to the actual journeys, the exploration patterns across the city. (And seriously, Instagram's new map feature is terrible, right?!)</p>" 
;


let divChapter2 =
  "<h3>Everyone is a Manhattanite?</h3>" +
  "<p>Oh boy I really need to go to other boroughs more often! It feels like so many things are happening there, but maybe I'm stuck in the 'Manhattan Bubble' along with many others. What do you think? </p>" +
  '<p style="text-align:center">' +
  '<img src="data/View.png"style="width:240px; margin: 20px 0;" />' +
  '</p>' 
;


let divChapter3 =
  "<h3>3 types of connection centers</h3>" +
  "<p><strong>1. Outward-Radiating Hubs:</strong> They are key starting points for journeys, places you tend to fan out from. The Met is a perfect example. I tend to start my day at a major landmark like this, and then my trips radiate outward to other spots in the city. </p>" +
  "<p><strong>2. Inward-Converging Hubs:</strong> They often represent comfort, maybe a reward, or just closure for the day. Places we go to refuel and relax. Lower Manhattan, for instance, is where many of my journeys conclude. This is likely because I love ending my day with a meal in Chinatown. </p>" +
  "<p><strong>3. Bidirectional Hubs:</strong> These centers, like Midtown, are the ultimate 'crossroads'. Thanks to great transportation and a variety of activities, they serve as both a transfer point and a great second destination on a trip, acting as a powerful magnet and a launchpad. </p>"+
  '<p style="text-align:center">' +
  '<img src="data/center.png"style="width:400px; margin: 20px 0;" />' +
  '</p>' 
  ;

let divChapter4 =
  "<h3>Route #1: Little Island -> Highline</h3>" +
  "<p>It also highlights one of my favorite city walks—starting at Little Island, wandering north along the High Line, and ending at the Vessel. This route is all about mixing nature and cool architecture, waterfront views, greenery, and modern design.</p>"+
  '<p style="text-align:center">' +
  '<img src="data/Highline.png"style="width:400px; margin: 20px 0;" />' +
  '</p>' 
;

let divChapter5 =
  "<h3>Route #2: Williamsburg Domino Park</h3>" +
  "<p>Another route hops over to Brooklyn, walking through Williamsburg, that vibrant neighborhood. And it concludes at Domino Park on the waterfront, where the journey finds its natural closure in the glow of a Manhattan sunset.</p>"+
  '<p style="text-align:center">' +
  '<img src="data/Williamsburg.png"style="width:400px; margin: 20px 0;" />' +
  '</p>' 
;

let divChapter6 =
  "<h3>Route #3: DUMBO → Brooklyn Bridge Park</h3>" +
  "<p>Another classic route starts in DUMBO and ends at Brooklyn Bridge Park, with stunning views of the Financial District skyline across the river</p>"+
  '<p style="text-align:center">' +
  '<img src="data/Bridge.png"style="width:400px; margin: 20px 0;" />' +
  '</p>' 
;

let divChapter7 =
  "<h3>Methodology</h3>" +
  "<p>It started by extracting the geolocation metadata, that is basically the latitude and longitude coordinates from every single iPhone photo I took in 2024. From January 1st right through to December 31st. Each photo then became like a distinct point on a map, a spatial point. But here's the clever part, weaving them together. Sequential photos taken on the same day were linked up with an arc, forming a trajectory. At the beginning of each new day, the trajectory was reset. These daily trajectories were exported in JSON format and visualized using Deck.gl in combination with Mapbox GL. Finally, a scrollytelling framework implemented in JavaScript was applied to integrate the visualizations into an interactive data journal where the visuals, the map, update dynamically to match the text you're reading.</p>" +
"<p><strong>Data Source:</strong> iPhone photo geolocation metadata, 2024-01-01 to 2024-12-31</p>" +
"<p><strong>Tools:</strong> Mapbox GL, Deck.gl, JavaScript</p>"
  ;

var config = {
  style: 'mapbox://styles/hongqianli/cmejipg4200yr01s4f7okhxgh',
  accessToken: "pk.eyJ1IjoiaG9uZ3FpYW5saSIsImEiOiJjbGticW84cjIwaGRjM2xvNjNrMjh4cmRyIn0.o65hBMiuqrCXY-3-bxGsUg",
  showMarkers: false,
  markerColor: "#000000ff",
  theme: "light",
  use3dTerrain: false,
  topTitle: topTitleDiv,
  title: titleDiv,
  subtitle: "",
  byline: bylineDiv,
  description: descriptionDiv,
  footer: footerDiv,
  chapters: [
    {
      id: "overview",
      alignment: "left",
      hidden: false,
      chapterDiv: divChapter1,
      location: {
        center: [-74.04, 40.75],
        zoom: 11,
        zoomSmall: 10,
        pitch: 10,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "showBothLayers",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "manhattanDetail",
      alignment: "right",
      hidden: false,
      chapterDiv: divChapter2,
      location: {
        center: [-73.76, 40.72],
        zoom: 10.2,
        zoomSmall: 10,
        pitch: 40,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "showBothLayers",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "connections",
      alignment: "left",
      hidden: false,
      chapterDiv: divChapter3,
      location: {
        center: [-73.915, 40.76],
        zoom: 11.8,
        zoomSmall: 14,
        pitch: 70,
        bearing: 120,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "showBothLayers",
      onChapterEnter: [
        {
          layer: "highlight-circles",
          opacity: 1,
          duration: 500,
        },
      ],
      onChapterExit: [
        {
          layer: "highlight-circles", 
          opacity: 0,
          duration: 500,
        },
      ],
    },
    {
      id: "brooklynView",
      alignment: "right",
      hidden: false,
      chapterDiv: divChapter4,
      location: {
        center: [-74.009, 40.73929],  
        zoom: 16,
        zoomSmall: 9.95,
        pitch: 60,
        bearing: 80,
      },
      mapAnimation: "flyTo",
      rotateAnimation: true,
      callback: "showBothLayers",
      onChapterEnter: [],
      onChapterExit: [],
    },
        {
      id: "walliamsburg",
      alignment: "left",
      hidden: false,
      chapterDiv: divChapter5,
      location: {
        center: [-73.9670272720601, 40.716778370973536],  
        zoom: 16.5,
        zoomSmall: 9.95,
        pitch: 60,
        bearing: 100,
      },
      mapAnimation: "flyTo",
      rotateAnimation: true,
      callback: "showBothLayers",
      onChapterEnter: [],
      onChapterExit: [],
    },
        {
      id: "brooklynbrg",
      alignment: "right",
      hidden: false,
      chapterDiv: divChapter6,
      location: {
        center: [-73.99751889066016,40.701512113419184], 
        zoom: 17,
        zoomSmall: 9.95,
        pitch: 70,
        bearing: 120,
      },
      mapAnimation: "flyTo",
      rotateAnimation: true,
      callback: "showBothLayers",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "networkView",
      alignment: "centered",
      hidden: false,
      chapterDiv: divChapter7,
      location: {
        center: [-74.08, 40.75],
        zoom: 10,
        zoomSmall: 9,
        pitch: 30,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: true,
      callback: "showBothLayers",
      onChapterEnter: [],
      onChapterExit: [],
    },
  ],
};