/// <reference path="../pb_data/types.d.ts" />
// Seeds all 18 industry templates. Runs only if templates collection is empty.
migrate((app) => {
  const existing = app.findRecordsByFilter("templates", "id != ''", "", 1, 0);
  if (existing.length > 0) return; // already seeded

  const templates = [
    {slug:"appliance-repair",industry_name:"Appliance Repair",included_in_base:false,
     default_service_items:[{name:"Diagnostic fee",price:75},{name:"Labor (per hour)",price:95},{name:"Washer repair",price:150},{name:"Dryer repair",price:140},{name:"Refrigerator repair",price:180},{name:"Dishwasher repair",price:130},{name:"Oven/stove repair",price:160}],
     asset_field_schema:[{label:"Appliance Type"},{label:"Brand / Model"},{label:"Serial #"}]},
    {slug:"auto-repair",industry_name:"Auto Repair",included_in_base:false,
     default_service_items:[{name:"Oil change",price:60},{name:"Brake pad replacement",price:180},{name:"Tire rotation",price:45},{name:"Battery replacement",price:150},{name:"Air filter replacement",price:35},{name:"Diagnostic scan",price:75},{name:"Fluid top-up",price:40},{name:"Wiper blade replacement",price:30}],
     asset_field_schema:[{label:"VIN"},{label:"License Plate"},{label:"Make / Model / Year"},{label:"Mileage"}]},
    {slug:"flooring",industry_name:"Carpet & Flooring",included_in_base:false,
     default_service_items:[{name:"Carpet cleaning (per room)",price:50},{name:"Carpet steam cleaning",price:80},{name:"Hardwood floor refinishing (per sqft)",price:4},{name:"Tile & grout cleaning",price:120},{name:"LVP/laminate installation (per sqft)",price:5},{name:"Carpet stretching & repair",price:100}],
     asset_field_schema:[{label:"Material Type"},{label:"Sq Footage"},{label:"# of Rooms"}]},
    {slug:"cleaning",industry_name:"Cleaning",included_in_base:false,
     default_service_items:[{name:"Standard cleaning",price:120},{name:"Deep cleaning",price:200},{name:"Move-in/move-out cleaning",price:280},{name:"Post-construction cleanup",price:350},{name:"Window cleaning (interior)",price:80},{name:"Refrigerator/oven deep clean",price:60}],
     asset_field_schema:[{label:"Property Type"},{label:"# of Rooms"},{label:"Sq Footage"}]},
    {slug:"computer-repair",industry_name:"Computer Repair",included_in_base:false,
     default_service_items:[{name:"Diagnostic fee",price:65},{name:"Virus/malware removal",price:90},{name:"OS reinstall",price:120},{name:"Hardware replacement (labor)",price:80},{name:"Data backup & transfer",price:70},{name:"Screen replacement (laptop)",price:150},{name:"RAM/SSD upgrade",price:60}],
     asset_field_schema:[{label:"Device Type"},{label:"Brand / Model"},{label:"Serial #"},{label:"Issue Description"}]},
    {slug:"electrical",industry_name:"Electrical",included_in_base:false,
     default_service_items:[{name:"Outlet installation",price:120},{name:"Circuit breaker replacement",price:150},{name:"Panel inspection",price:100},{name:"Lighting installation",price:140},{name:"Ceiling fan installation",price:130},{name:"GFCI outlet install",price:110}],
     asset_field_schema:[{label:"Panel Brand"},{label:"Breaker Size (amps)"},{label:"Property Type"}]},
    {slug:"electronics-repair",industry_name:"Electronics Repair",included_in_base:false,
     default_service_items:[{name:"Diagnostic fee",price:50},{name:"Board-level repair",price:120},{name:"Screen replacement",price:140},{name:"Charging port repair",price:80},{name:"Speaker / mic repair",price:70},{name:"Battery replacement",price:60},{name:"Water damage service",price:100}],
     asset_field_schema:[{label:"Device Type"},{label:"Brand / Model"},{label:"Fault / Symptom"},{label:"Serial / IMEI"}]},
    {slug:"hvac",industry_name:"HVAC",included_in_base:true,
     default_service_items:[{name:"AC tune-up & inspection",price:90},{name:"Furnace inspection",price:110},{name:"Filter replacement",price:35},{name:"Refrigerant recharge",price:180},{name:"Thermostat installation",price:130},{name:"Duct cleaning (per vent)",price:25},{name:"AC unit installation",price:1200},{name:"Emergency repair call",price:150}],
     asset_field_schema:[{label:"System Type (AC/Furnace/Heat Pump)"},{label:"Brand / Model"},{label:"Install Date"},{label:"Serial #"}]},
    {slug:"handyman",industry_name:"Handyman",included_in_base:true,
     default_service_items:[{name:"General repair",price:80},{name:"Furniture assembly",price:60},{name:"Door/window repair",price:90},{name:"Drywall patch",price:120},{name:"Caulking & sealing",price:70},{name:"TV/shelf mounting",price:75}],
     asset_field_schema:[{label:"Job Location / Description"}]},
    {slug:"landscaping",industry_name:"Landscaping",included_in_base:false,
     default_service_items:[{name:"Lawn mowing",price:50},{name:"Edging & trimming",price:40},{name:"Bush/hedge trimming",price:65},{name:"Leaf blowing & cleanup",price:45},{name:"Mulch installation",price:120},{name:"Weed control treatment",price:80}],
     asset_field_schema:[{label:"Property Size (sqft)"},{label:"Lot Description"}]},
    {slug:"painting",industry_name:"Painting",included_in_base:false,
     default_service_items:[{name:"Interior painting (per room)",price:300},{name:"Exterior painting (per side)",price:500},{name:"Trim & baseboard painting",price:150},{name:"Primer coat",price:100},{name:"Ceiling painting",price:200},{name:"Deck/fence staining",price:350}],
     asset_field_schema:[{label:"Area / Room"},{label:"Surface Type"},{label:"Sq Footage"}]},
    {slug:"pest-control",industry_name:"Pest Control",included_in_base:false,
     default_service_items:[{name:"Interior treatment",price:110},{name:"Exterior perimeter spray",price:90},{name:"Termite inspection",price:150},{name:"Rodent exclusion",price:200},{name:"Bed bug treatment",price:300},{name:"Quarterly maintenance visit",price:85}],
     asset_field_schema:[{label:"Pest Type"},{label:"Treatment Area"},{label:"Property Type"}]},
    {slug:"pet-grooming",industry_name:"Pet Grooming",included_in_base:false,
     default_service_items:[{name:"Full groom (bath + cut)",price:65},{name:"Bath & brush only",price:40},{name:"Nail trim",price:15},{name:"Ear cleaning",price:15},{name:"De-shedding treatment",price:30},{name:"Teeth brushing",price:10}],
     asset_field_schema:[{label:"Pet Name"},{label:"Breed"},{label:"Weight (lbs)"},{label:"Special Notes"}]},
    {slug:"plumbing",industry_name:"Plumbing",included_in_base:true,
     default_service_items:[{name:"Drain cleaning",price:120},{name:"Leak repair",price:150},{name:"Pipe installation",price:200},{name:"Water heater flush",price:95},{name:"Toilet repair",price:110},{name:"Faucet replacement",price:130}],
     asset_field_schema:[{label:"Property Address"},{label:"Water Heater Brand/Model"}]},
    {slug:"pool-service",industry_name:"Pool Service",included_in_base:false,
     default_service_items:[{name:"Weekly cleaning & chemical balance",price:120},{name:"Filter cleaning",price:80},{name:"Algae treatment",price:150},{name:"Pump inspection",price:90},{name:"Acid wash",price:350},{name:"Opening/closing service",price:200}],
     asset_field_schema:[{label:"Pool Type (in-ground/above-ground)"},{label:"Approx. Gallons"},{label:"Equipment Brand"}]},
    {slug:"pressure-washing",industry_name:"Pressure Washing",included_in_base:false,
     default_service_items:[{name:"Driveway washing",price:120},{name:"House exterior wash",price:250},{name:"Deck/patio washing",price:150},{name:"Fence washing",price:100},{name:"Sidewalk & walkway",price:80},{name:"Roof soft wash",price:300}],
     asset_field_schema:[{label:"Surface Type"},{label:"Sq Footage"}]},
    {slug:"roofing",industry_name:"Roofing",included_in_base:false,
     default_service_items:[{name:"Roof inspection",price:150},{name:"Shingle replacement (per square)",price:350},{name:"Leak repair",price:280},{name:"Gutter cleaning",price:120},{name:"Flashing repair",price:200},{name:"Skylight seal",price:175}],
     asset_field_schema:[{label:"Roof Type"},{label:"Material"},{label:"Approx. Sq Footage"}]},
    {slug:"tree-service",industry_name:"Tree Service",included_in_base:false,
     default_service_items:[{name:"Tree trimming/pruning",price:200},{name:"Tree removal (small <20ft)",price:350},{name:"Tree removal (medium 20-40ft)",price:650},{name:"Stump grinding",price:150},{name:"Emergency tree removal",price:800},{name:"Debris hauling",price:100}],
     asset_field_schema:[{label:"Tree Species"},{label:"Approx. Height (ft)"},{label:"Location on Property"}]},
  ];

  const col = app.findCollectionByNameOrId("templates");
  for (const t of templates) {
    const rec = new Record(col);
    rec.set("slug", t.slug);
    rec.set("industry_name", t.industry_name);
    rec.set("included_in_base", t.included_in_base);
    rec.set("default_service_items", t.default_service_items);
    rec.set("asset_field_schema", t.asset_field_schema);
    rec.set("default_terms_draft", "");
    rec.set("report_template_html", "");
    app.save(rec);
  }
}, (app) => {
  const recs = app.findRecordsByFilter("templates", "id != ''", "", 100, 0);
  for (const r of recs) app.delete(r);
});
