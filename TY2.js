const TY = (() => { 
    const version = '1.10.31    ';
    if (!state.TY) {state.TY = {}};

    const gameScale = 1; //1 = Normal Movement, 0.5 = Half Movement

    //Constants and Persistent Variables

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","BB","CC","DD","EE","FF","GG","HH","II","JJ","KK","LL","MM","NN","OO","PP","QQ","RR","SS","TT","UU","VV","WW","XX","YY","ZZ","AAA","BBB","CCC","DDD","EEE","FFF","GGG","HHH","III","JJJ","KKK","LLL","MMM","NNN","OOO","PPP","QQQ","RRR","SSS","TTT","UUU","VVV","WWW","XXX","YYY","ZZZ"];

    let TerrainArray = {};
    let TeamArray = {}; //Individual Squads, Tanks etc
    let UnitArray = {}; //Units of Teams eg. Platoon
    let FormationArray = {}; //to track formations
    let SmokeArray = [];
    let FoxholeArray = [];
    let CheckArray = []; //used by Remount, Rally and Morale checks
    let RangedInArray = {};

    let unitCreationInfo = {}; //used during unit creation 
    let unitIDs4Saves = {}; //used during shooting routines
    let unitFiredThisTurn = false; //marker for smoke bombardments, inCommand
    let CCTeamIDs = []; //array of teams (IDs) in a CC, updated when charge/move
    let assaultingUnitID = "";
    let deadHQs = [[],[]]; //formationIDs of any formations that lost leaders in prev. turn, by player


    let hexMap = {}; 
    let edgeArray = [];
    const DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
    const Colours = {
        green: "#00ff00",
        lightblue: "#00ffff",
        purple: "#800080",
        brown: "#980000",
        red: "#ff0000",
        yellow: "#ffff00",
        orange: "#ff9900",
        darkblue: "#0000ff",
        lightpurple: "#ff00ff",
        black: "#000000",
    }

    const SM = {
        "flare": "status_Flare::5867553",
        "defensive": "status_green",
        "surprised": "status_yellow",
        "HQ": "status_black-flag",
    };

    let specialInfo = {
        "Artillery": "Team has a weapon capable of an Artillery Barrage",
        'Assault Smoke': "May fire a Smoke Bombardment in same turn they Assault",
        "Bazooka Skirts": "Side Armour increased to 5 against Infantry Weapons with FP 5+ or 6",
        "Bombs": "Bombs do not need to re-roll successful To Hit rolls for having only 1 or 2 weapons firing",
        "Brutal": "Infantry, Gun and Unarmoured Tank Teams re-roll successful Saves against Brutal Weapons",
        "Dedicated AA": "Dedicated AA Weapons can Shoot at Aircraft using their Halted ROF",
        "Flamethrower": "Infantry, Gun, and Unarmoured Tank Teams re-roll successful Saves when hit by a Flame-thrower and the Unit is automatically Pinned Down. Armoured Tank Teams use their Top armour for Armour Saves when hit by a Flame-thrower.",
        "Forward Firing": "Forward Firing Weapons can only target Teams fully in front of the Shooter",
        "Gun Shield": "Gives Bulletproof Cover when shot at from the Front. No protection against Bombardments or if the Team moved at Dash speed",
        "HEAT": "A Team's Armour is not increased by +1 if at long Range vs HEAT",
        "Heavy Weapon": "A Heavy Weapon Team cannot Charge into Contact",
        "HQ": "Always In Command and ignores Morale Checks. May Spot for Artillery",
        "Independent": "An Independent Team",
        "Large Gun": 'Cannot be placed in Buildings and cannot be placed from Ambush within ' + 16*gameScale + '" of enemy',
        "Limited 1": "Each time the Unit  shoots, one of its Teams may shoot this weapon rather than its usual weapons",
        "No HE": "A weapon with no HE targetting an Infantry or Gun Team add +1 to the score needed To Hit",
        "Old Hand": 'An Old Hand Commander gives Units from their Formation whose Unit Leader is within 6" a Tactics rating of 3+', //command not affected by scale
        "Observer": "Observer Teams can Spot for Artillery",
        "Overhead Fire": "Grenade Launchers and Light Mortars capable of Overhead Fire can fire over friendly team",
        "Overworked": "Overworked weapons add +1 to the score needed To Hit when moving",
        "Passengers #": "A Transport Team can carry # Infantry Teams as Passengers",
        "Pinned ROF 1": "These weapons have a ROF of 1 when Pinned Down",
        "Pioneers": 'Can cross Minefields safely on a 2+. If remain in Minefield and not Pinned Down, clear the Minefield automatically',
        "Redemption": "May not be placed in Reserve. Gets special Deployment, never benefits from Bulletproof Cover, cannot hold Objectives but can Contest them",
        "Salvo": "Use a larger Artillery Template",
        "Sapper Body Armour": "Gets a Save of 6 in Close Combat",
        "Scout": "Scouts are Gone to Ground unless they Shoot or Assault",
        "Self Defence AA": "Self-Defence AA weapons can Shoot at Aircraft with ROF 1",
        "Slow Firing": "Slow Firing Weapons add +1 to the score needed To Hit when moving",
        "Smoke": "Smoke weapons can Shoot Smoke ammunition",
        "Smoke Bombardment": "Once per game, the weapon can fire a Smoke Bombardment",
        "Spearhead": "Special Rules for Deployment (page 93)",
        "Stormtroopers": "The Unit may attempt a second Special Order after succeeding in its first Special Order. The second Movement Order must be different from the first.",
        "Tank Escorts": 'One Team per Tank can shoot while mounted on Tanks and can Dismount when Charging into Contact',
        "Tankodesantniki": 'One Team per Tank can shoot while mounted on Tanks and can Dismount when Charging into Contact',
        "Tractor": "A Tractor Team can tow a single Gun Team as a Passenger, placing the Gun Team behind it",
        "Unarmoured": "An Unarmoured Tank Team cannot Charge into Contact and must Break Off if Assaulted",
        "Unit Transport": 'The Unit Leader of the Transport Attachment must end the Movement Step within 6”/15cm of the Unit Leader of its Passenger Unit while on table. If it cannot do this, then the Transport Attachment must be Sent to the Rear.',
        "Urrah": "Units with Urrah may charge " + 6*gameScale + '" into Close Combat',

    };

    const SaveResults = {
        "deflect": "Hit deflected by Armour",
        "minor": "Hit caused Minor damage only",
        "destroyed": "[#ff0000]Hit Destroys the Team[/#]",
        "bailed": "[#0000ff]Hit caused Moderate Damage to Vehicle, Crew Suppressed[/#]",
        "bailedAgain": "[#0000ff]Hit caused Moderate Damage to Vehicle, Crew Remains Suppressed[/#]",
        "flees": "[#ff0000]Hit Destroys Tank as the Crew Flees![/#]",
        "saved": "Hit Saved",
        "cover": "Hit Saved by Cover",
    }

    const SaveResultsMult = {
        "deflect": "All Hits deflected by Armour",
        "minor": "Hits cause Minor damage only",
        "destroyed": "[#ff0000]Hits Destroy the Team[/#]",
        "bailed": "[#0000ff]Hits cause Moderate Damage to Vehicle, Crew Suppressed[/#]",
        "bailedAgain": "[#0000ff]Hits cause Moderate Damage to Vehicle, Crew Remains Suppressed[/#]",
        "flees": "[#ff0000]Hits Destroy Tank as the Crew Flees![/#]",
        "saved": "All Hits Saved",
        "cover": "All Hits Saved (Cover)",
    }

    const PM = ["status_Green-01::2006603","status_Green-02::2006607","status_Green-03::2006611"];

    let outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: []};
    const WarsawPact = ["Soviet","Poland"];
    const NATO = ["US Army","US Marine Corps","British","West Germany","Canada"];
    const lastStandCount = {"Infantry": 3,"Gun": 2,"Tank": 2,"Unarmoured Tank": 2,"Aircraft": 1,};

    const Ranks = {
                "Germany": ["Major ","Hauptmann ","Oberleutnant ","Feldwebel "],
                "Western": ["Major ","Captain ","Lieutenant ","Sergeant "],
                "Soviet": ["Podpolkovnik ","Majór ","Kapitán ","Leytnant ","Serzhant "],
    };

    //Types: Flat = 0, Short = 1, Tall = 2, Building = 3
    //Dash: Road = 0,Country = 1,Terrain = 2, Building/Tank Obstacle = 3, Impassable = 4

    const TerrainInfo = {
        "#00ff00": {name: "Woods",height: 2,bp: false,type: 2,group: "Woods",dash: 2},
        "#20124d": {name: "Ruins",height: 1,bp: true,type: 1,group: "Rough",dash: 2},
        "#000000": {name: "Hill 1",height:1,bp: false,type: 0,group: "Hill",dash: 1},
        "#434343": {name: "Hill 2",height:2,bp: false,type: 0,group: "Hill",dash: 1},
        "#666666": {name: "Hill 3",height:3,bp: false,type: 0,group: "Hill",dash: 1},
        "#c0c0c0": {name: "Hill 4",height:4,bp: false,type: 0,group: "Hill",dash: 1},
        "#00ffff": {name: "Stream",height: 0,bp: false,type: 0,group: "Water",dash: 2},
        "#b6d7a8": {name: "Scrub",height: 0,bp: false,type: 1,group: "Crops",dash: 2},
        "#980000": {name: "Low Embankment",height: 0.25,bp: false,type: 0,group: "Hill",dash: 2},
        "#ffffff": {name: "Ridgeline",height: .25,bp: true,type: 1,group: "Hill",dash: 1},
    }

    const MapTokenInfo = {
        "wreck": {name: "Wreck",height: 0,bp: true,type: 1,group: "Obstacle",dash: 2},
        "building 1": {name: "Building 1",height: 1,bp: true,type: 3,group: "Building",dash: 3},
        "building 2": {name: "Building 2",height: 2,bp: true,type: 3,group: "Building",dash: 3},
        "building 3": {name: "Building 3",height: 3,bp: true,type: 3,group: "Building",dash: 3},
        "rubble": {name: "Rubble",height: 0,bp: true,type: 1,group: "Rough",dash: 2},
        "anti-tank ditch": {name: "Anti-Tank Ditch",height: 0,bp: true,type: 0,group: "Trench",dash: 3},
        "wall": {name: "Wall",height: 0,bp: true,type: 1,group: "Obstacle",dash: 2},
        "hedge": {name: "Hedge",height: 0,bp: false,type: 1,group: "Obstacle",dash: 2},
        "bocage": {name: "Bocage",height: 0,bp: true,type: 2,group: "Obstacle",dash: 2},
        "dragon's teeth": {name: "Dragon's Teeth",height: 0,bp: true,type: 1,group: "Obstacle",dash: 4},
        "road block": {name: "Road Block",height: 0,bp: true,type: 1,group: "Obstacle",dash: 4},
        "crater": {name: "Craters",height: 0,bp: true,type: 0,group: "Rough",dash: 3},        
        "crops": {name: "Crops",height: 0,bp: false,type: 1,group: "Crops",dash: 1},
        "foxholes": {name: "Foxholes",height: 0,bp: false,type: 0,group: "Foxholes",dash: 2}, //bp tracked in LOS, and in hexMap
        "smoke": {name: "Smoke",height: 0,bp: false,type: 0,group: "Smoke",dash: 1},
        "smokescreen": {name: "SmokeScreen",height: 10,bp:false,type: 0,group: "Smoke",dash: 1},
        "rangedin": {name: "rangedin",height: 0,bp:false,type: 0,group: "Marker",dash: 1},
    }

    const Nations = {
        "Soviet": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324272729/H0Ea79FLkZIn-3riEhuOrA/thumb.png?1674441877",
            "dice": "Soviet",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FFFF00",
            "borderStyle": "5px groove",
            "atWeapon": "Molotov Cocktails",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/307909232/aEbkdXCShELgc4zcz89srg/thumb.png?1665016513",
            "pinned": "https://s3.amazonaws.com/files.d20.io/images/364582400/VKa2E3Avx1Jd4OKUcuWjxA/thumb.png?1698090348",
            "pinnedCharID": "-NhltPoS8_P4_rslcUsA",
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/319032004/qf3aHgIiFnJ0aYoPOFR-TA/thumb.png?1671325647",
            "barrageChar": "-NUlUj2snn9vRtAo2k2l", 
            "objectiveimage": "https://s3.amazonaws.com/files.d20.io/images/365313516/Bpy0UrmmYYph7t5xLL0o9A/thumb.png?1698546715",
            "platoonmarkers": ["letters_and_numbers0099::4815235","letters_and_numbers0100::4815236","letters_and_numbers0101::4815237","letters_and_numbers0102::4815238","letters_and_numbers0103::4815239","letters_and_numbers0104::4815240","letters_and_numbers0105::4815241","letters_and_numbers0106::4815242","letters_and_numbers0107::4815243","letters_and_numbers0108::4815244","letters_and_numbers0109::4815245","letters_and_numbers0110::4815246","letters_and_numbers0111::4815247","letters_and_numbers0112::4815248","letters_and_numbers0113::4815249","letters_and_numbers0114::4815250","letters_and_numbers0115::4815251","letters_and_numbers0116::4815252","letters_and_numbers0117::4815253","letters_and_numbers0118::4815254","letters_and_numbers0119::4815255","letters_and_numbers0120::4815256","letters_and_numbers0121::4815257","letters_and_numbers0122::4815258","letters_and_numbers0123::4815259","letters_and_numbers0124::4815260"],
        },
        "West Germany": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/329415788/ypEgv2eFi-BKX3YK6q_uOQ/thumb.png?1677173028",
            "dice": "West-German",
            "backgroundColour": "#000000",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            "atWeapon": "Stielhandgranates",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/307909216/Cqm8z6ZX2WPDQkodhdLVqQ/thumb.png?1665016507",
            "pinned": "https://s3.amazonaws.com/files.d20.io/images/364580773/vg85YjKhl8LBdp-FSbTBtQ/thumb.png?1698089517",
            "pinnedCharID": "",
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/319029852/xSAh0T5hTSCOSHrRZKBrtA/thumb.png?1671324745",
            "barrageChar": "",  
            "objectiveimage": "",
            "platoonmarkers": ["letters_and_numbers0197::4815333","letters_and_numbers0198::4815334","letters_and_numbers0199::4815335","letters_and_numbers0200::4815336","letters_and_numbers0201::4815337","letters_and_numbers0202::4815338","letters_and_numbers0203::4815339","letters_and_numbers0204::4815340","letters_and_numbers0205::4815341","letters_and_numbers0206::4815342","letters_and_numbers0207::4815343","letters_and_numbers0208::4815344","letters_and_numbers0209::4815345","letters_and_numbers0210::4815346","letters_and_numbers0211::4815347","letters_and_numbers0212::4815348","letters_and_numbers0213::4815349","letters_and_numbers0214::4815350","letters_and_numbers0215::4815351","letters_and_numbers0216::4815352","letters_and_numbers0217::4815353","letters_and_numbers0218::4815354","letters_and_numbers0219::4815355","letters_and_numbers0220::4815356","letters_and_numbers0221::4815357","letters_and_numbers0222::4815358"],
        },
        "British": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/330506939/YtTgDTM3q7p8m0fJ4-E13A/thumb.png?1677713592",
            "backgroundColour": "#0E2A7A",
            "dice": "UK",
            "titlefont": "Merriweather",
            "fontColour": "#FFFFFF",
            "borderColour": "#BC2D2F",
            "borderStyle": "5px groove",
            "atWeapon": "Sticky Bombs",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/328837544/KrWC027rT0Lw_ghCuu_5DQ/thumb.png?1676838067",
            "pinned": "https://s3.amazonaws.com/files.d20.io/images/365311899/aJNi6yvCdnwEINZWsAL63g/thumb.png?1698545921",
            "pinnedCharID": "-NhtBzw_bXWrJORCxWZK",
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/327891446/xsAVVJ0Ft-xZW92JUtZBdw/thumb.png?1676321000",
            "barrageChar": "-NUlUkuOz7tjIrafOcNo",
            "objectiveimage": "https://s3.amazonaws.com/files.d20.io/images/365313551/2_miHmMrIheFFKq-5m3Iyw/thumb.png?1698546731",
            "platoonmarkers": ["letters_and_numbers0148::4815284","letters_and_numbers0149::4815285","letters_and_numbers0150::4815286","letters_and_numbers0151::4815287","letters_and_numbers0152::4815288","letters_and_numbers0153::4815289","letters_and_numbers0154::4815290","letters_and_numbers0155::4815291","letters_and_numbers0156::4815292","letters_and_numbers0157::4815293","letters_and_numbers0158::4815294","letters_and_numbers0159::4815295","letters_and_numbers0160::4815296","letters_and_numbers0161::4815297","letters_and_numbers0162::4815298","letters_and_numbers0163::4815299","letters_and_numbers0164::4815300","letters_and_numbers0165::4815301","letters_and_numbers0166::4815302","letters_and_numbers0167::4815303","letters_and_numbers0168::4815304","letters_and_numbers0169::4815305","letters_and_numbers0170::4815306","letters_and_numbers0171::4815307","letters_and_numbers0172::4815308","letters_and_numbers0173::4815309"],
        },
        "US Army": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327595663/Nwyhbv22KB4_xvwYEbL3PQ/thumb.png?1676165491",
            "backgroundColour": "#FFFFFF",
            "dice": "USA",
            "titlefont": "Arial",
            "fontColour": "#006400",
            "borderColour": "#006400",
            "borderStyle": "5px double",
            "atWeapon": "Hand Grenades",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/328835139/zd6jnMDVIEEvRg_cNkHxeQ/thumb.png?1676837399",
            "pinned": "https://s3.amazonaws.com/files.d20.io/images/365311909/Gu6sVBnrKauP0gibski5CQ/thumb.png?1698545925",
            "pinnedCharID": "-NhtC--h2t90ayjtfXPx",
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/327891469/QfaYQvRbVs7tA_3jGFwQ9Q/thumb.png?1676321007",
            "barrageChar": "-NUlUl6uxp5omEWaZfze",  
            "objectiveimage": "https://s3.amazonaws.com/files.d20.io/images/365313723/o7CvHeJhHOVJ9h2tUECKfQ/thumb.png?1698546825",
            "platoonmarkers": ["letters_and_numbers0050::4815186","letters_and_numbers0051::4815187","letters_and_numbers0052::4815188","letters_and_numbers0053::4815189","letters_and_numbers0054::4815190","letters_and_numbers0055::4815191","letters_and_numbers0056::4815192","letters_and_numbers0057::4815193","letters_and_numbers0058::4815194","letters_and_numbers0059::4815195","letters_and_numbers0060::4815196","letters_and_numbers0061::4815197","letters_and_numbers0062::4815198","letters_and_numbers0063::4815199","letters_and_numbers0064::4815200","letters_and_numbers0065::4815201","letters_and_numbers0066::4815202","letters_and_numbers0067::4815203","letters_and_numbers0068::4815204","letters_and_numbers0069::4815205","letters_and_numbers0070::4815206","letters_and_numbers0071::4815207","letters_and_numbers0072::4815208","letters_and_numbers0073::4815209","letters_and_numbers0074::4815210","letters_and_numbers0075::4815211"],
        },
        "US Marine Corps": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327769203/uM2mlqoLnxDD_ptnBdNXfg/thumb.png?1676240966",
            "dice": "USMC",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#00008B",
            "borderColour": "#00008B",
            "borderStyle": "5px double",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/328835177/sjCggEYtL2PfE32fyQV4zw/thumb.png?1676837406",
            "platoonmarkers": ["","letters_and_numbers0148::4815284","letters_and_numbers0149::4815285","letters_and_numbers0150::4815286","letters_and_numbers0151::4815287","letters_and_numbers0152::4815288","letters_and_numbers0153::4815289","letters_and_numbers0154::4815290","letters_and_numbers0155::4815291","letters_and_numbers0156::4815292","letters_and_numbers0157::4815293","letters_and_numbers0158::4815294","letters_and_numbers0159::4815295","letters_and_numbers0160::4815296","letters_and_numbers0161::4815297","letters_and_numbers0162::4815298","letters_and_numbers0163::4815299","letters_and_numbers0164::4815300","letters_and_numbers0165::4815301","letters_and_numbers0166::4815302","letters_and_numbers0167::4815303","letters_and_numbers0168::4815304","letters_and_numbers0169::4815305","letters_and_numbers0170::4815306","letters_and_numbers0171::4815307","letters_and_numbers0172::4815308","letters_and_numbers0173::4815309"],
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/327891469/QfaYQvRbVs7tA_3jGFwQ9Q/thumb.png?1676321007",
            "barrageChar": "-NUlUl6uxp5omEWaZfze",         
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "dice": "UK",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            "objectiveimage": "https://s3.amazonaws.com/files.d20.io/images/312111244/vPCrjmQ7ep4nvKWu8LOmFQ/thumb.png?1667256328",
        },

        "US Marine Corps": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327769203/uM2mlqoLnxDD_ptnBdNXfg/thumb.png?1676240966",
            "dice": "USMC",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#00008B",
            "borderColour": "#00008B",
            "borderStyle": "5px double",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/328835177/sjCggEYtL2PfE32fyQV4zw/thumb.png?1676837406",
            "platoonmarkers": ["","letters_and_numbers0148::4815284","letters_and_numbers0149::4815285","letters_and_numbers0150::4815286","letters_and_numbers0151::4815287","letters_and_numbers0152::4815288","letters_and_numbers0153::4815289","letters_and_numbers0154::4815290","letters_and_numbers0155::4815291","letters_and_numbers0156::4815292","letters_and_numbers0157::4815293","letters_and_numbers0158::4815294","letters_and_numbers0159::4815295","letters_and_numbers0160::4815296","letters_and_numbers0161::4815297","letters_and_numbers0162::4815298","letters_and_numbers0163::4815299","letters_and_numbers0164::4815300","letters_and_numbers0165::4815301","letters_and_numbers0166::4815302","letters_and_numbers0167::4815303","letters_and_numbers0168::4815304","letters_and_numbers0169::4815305","letters_and_numbers0170::4815306","letters_and_numbers0171::4815307","letters_and_numbers0172::4815308","letters_and_numbers0173::4815309"],
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/327891469/QfaYQvRbVs7tA_3jGFwQ9Q/thumb.png?1676321007",
            "barrageChar": "-NUlUl6uxp5omEWaZfze",         
        },
        "Warsaw Pact": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/341399561/LeCkvkoO5ea8g2bgODSoog/thumb.webp?1683859633",
            "dice": "Soviet",
            "backgroundColour": "#FFFF00",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FF0000",
            "borderStyle": "5px ridge",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/307909232/aEbkdXCShELgc4zcz89srg/thumb.png?1665016513",
            "platoonmarkers": ["","letters_and_numbers0099::4815235","letters_and_numbers0100::4815236","letters_and_numbers0101::4815237","letters_and_numbers0102::4815238","letters_and_numbers0103::4815239","letters_and_numbers0104::4815240","letters_and_numbers0105::4815241","letters_and_numbers0106::4815242","letters_and_numbers0107::4815243","letters_and_numbers0108::4815244","letters_and_numbers0109::4815245","letters_and_numbers0110::4815246","letters_and_numbers0111::4815247","letters_and_numbers0112::4815248","letters_and_numbers0113::4815249","letters_and_numbers0114::4815250","letters_and_numbers0115::4815251","letters_and_numbers0116::4815252","letters_and_numbers0117::4815253","letters_and_numbers0118::4815254","letters_and_numbers0119::4815255","letters_and_numbers0120::4815256","letters_and_numbers0121::4815257","letters_and_numbers0122::4815258","letters_and_numbers0123::4815259","letters_and_numbers0124::4815260"],
        },
        "NATO": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/341399549/70dmI15RviYyvp1MxHkf4A/thumb.webp?1683859627",
            "backgroundColour": "#0A2065",
            "dice": "British",
            "titlefont": "Merriweather",
            "fontColour": "#FFFFFF",
            "borderColour": "#BC2D2F",
            "borderStyle": "5px groove",
            "rangedIn": "https://s3.amazonaws.com/files.d20.io/images/328837544/KrWC027rT0Lw_ghCuu_5DQ/thumb.png?1676838067",
            "platoonmarkers": ["","letters_and_numbers0148::4815284","letters_and_numbers0149::4815285","letters_and_numbers0150::4815286","letters_and_numbers0151::4815287","letters_and_numbers0152::4815288","letters_and_numbers0153::4815289","letters_and_numbers0154::4815290","letters_and_numbers0155::4815291","letters_and_numbers0156::4815292","letters_and_numbers0157::4815293","letters_and_numbers0158::4815294","letters_and_numbers0159::4815295","letters_and_numbers0160::4815296","letters_and_numbers0161::4815297","letters_and_numbers0162::4815298","letters_and_numbers0163::4815299","letters_and_numbers0164::4815300","letters_and_numbers0165::4815301","letters_and_numbers0166::4815302","letters_and_numbers0167::4815303","letters_and_numbers0168::4815304","letters_and_numbers0169::4815305","letters_and_numbers0170::4815306","letters_and_numbers0171::4815307","letters_and_numbers0172::4815308","letters_and_numbers0173::4815309"],
        },
        "Canada": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/341315251/n0tyjwJROMhYYaJhteCF_Q/thumb.png?1683817346",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#EA3423",
            "borderStyle": "5px groove",
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/340585556/aqSICgjEkrT9sLf730UJIA/thumb.png?1683384058",
            "barrageChar": "-NUlVpaKAbNPTitcQRzi",
        },
        "Poland": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/341315137/Y92DdqCPCBvk4hcmPk6fRw/thumb.png?1683817256",
            "backgroundColour": "#CA3742",
            "titlefont": "Arial",
            "fontColour": "#FFFFFF",
            "borderColour": "#FFFFFF",
            "borderStyle": "5px groove",
            "barrageimage": "https://s3.amazonaws.com/files.d20.io/images/319032004/qf3aHgIiFnJ0aYoPOFR-TA/thumb.png?1671325647",
            "barrageChar": "-NUlUj2snn9vRtAo2k2l",
        },



    }

    //Hex Info
    const xSpacing = 75.1985619844599;
    const ySpacing = 66.9658278242677;

    const HexInfo = {
        size: {
            x: xSpacing/Math.sqrt(3),
            y: ySpacing * 2/3,
        },
        pixelStart: {
            x: xSpacing/2,
            y: 43.8658278242683,
        },
        halfX: xSpacing/2,
        width: xSpacing,
        height: 89.2877704323569,
        directions: {},
    };

    const M = {
            f0: Math.sqrt(3),
            f1: Math.sqrt(3)/2,
            f2: 0,
            f3: 3/2,
            b0: Math.sqrt(3)/3,
            b1: -1/3,
            b2: 0,
            b3: 2/3,
    };

    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
    };

    class Hex {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        subtract(b) {
            return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Hex(qi, ri, si);
        }
        lerp(b, t) {
            return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b'
            var N = this.distance(b);
            var a_nudge = new Hex(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Hex(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 0; i <= N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            //translate hex qrs to Roll20 map label
            let doubled = DoubledCoord.fromCube(this);
            let label = rowLabels[doubled.row] + (doubled.col + 1).toString();
            return label;
        }

        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Hex(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }
        angle(b) {
            //angle between 2 hexes
            let origin = hexToPoint(this);
            let destination = hexToPoint(b);

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
    };

    class DoubledCoord {
        constructor(col, row) {
            this.col = col;
            this.row = row;
        }
        static fromCube(h) {
            var col = 2 * h.q + h.r;
            var row = h.r;
            return new DoubledCoord(col, row);//note will need to use rowLabels for the row, and add one to column to translate from 0
        }
        toCube() {
            var q = (this.col - this.row) / 2; //as r = row
            var r = this.row;
            var s = -q - r;
            return new Hex(q, r, s);
        }
    };

    const pointToHex = (point) => {
        let x = (point.x - HexInfo.pixelStart.x)/HexInfo.size.x;
        let y = (point.y - HexInfo.pixelStart.y)/HexInfo.size.y;
        let q = M.b0 * x + M.b1 * y;
        let r = M.b2 * x + M.b3 * y;
        let s = -q-r;
        let hex = new Hex(q,r,s);
        hex = hex.round();
        return hex;
    }

    const hexToPoint = (hex) => {
        let q = hex.q;
        let r = hex.r;
        let x = (M.f0 * q + M.f1 * r) * HexInfo.size.x;
        x += HexInfo.pixelStart.x;
        let y = (M.f2 * r + M.f3 * r) * HexInfo.size.y;
        y += HexInfo.pixelStart.y;
        let point = new Point(x,y);
        return point;
    }

    //core classes
    class Formation {
        constructor(nation,id,name){
            if (!id) {
                id = stringGen();
            }
            this.id = id;
            this.name = name;
            this.nation = nation;
            this.player = (WarsawPact.includes(nation)) ? 0:1;
            this.unitIDs = [];

            if (!state.TY.formations[id]) {
                state.TY.formations[id] = name;
            }
            FormationArray[id] = this;
        }

        add(unit) {
            if (this.unitIDs.includes(unit.id) === false) {
                this.unitIDs.push(unit.id);
                unit.formationID = this.id;
            }
        }

        remove(unit) {
            let index = this.unitIDs.indexOf(unit.id);
            if (index > -1) {
                this.unitIDs.splice(index,1);
            }
            if (this.unitIDs.length === 0) {
                SetupCard("Formation Destroyed","",this.nation);
                PrintCard();
            }
        }
    }

    class Unit {
        constructor(nation,id,name,formationID){
            if (!id) {
                id = stringGen();
            }
            this.id = id;
            this.name = name;
            this.order = "";
            this.specialorder = "";
            this.nation = nation;
            this.player = (WarsawPact.includes(nation)) ? 0:1;
            this.formationID = formationID;
            this.teamIDs = [];
            this.hqUnit = false;
            this.artillery = false;
            this.type = "";
            this.number = 0;
            this.linkedUnitID = ""; //used in Mistaken for HQ units
            this.limited = 0; //used to track limited use weapons
            this.inReserve = false;
            this.size; //used for pinning purposes, size of unit at start of turn

            if (!state.TY.units[id]) {
                state.TY.units[id] = name;
            }

            UnitArray[id] = this;
        }

        add(team) {
            if (this.teamIDs.includes(team.id) === false) {
                if (team.token.get("status_black-flag") === true) {
                    this.teamIDs.unshift(team.id);
                } else {
                    this.teamIDs.push(team.id);
                }
                team.unitID = this.id;
                if (team.special.includes("HQ") || team.token.get(SM.HQ)) {
                    this.hqUnit = true;
                }
                if (team.special.includes("Artillery")) {
                    this.artillery = true;
                }
                if (team.special.includes("Transport") === false) {
                    this.type = team.type;
                } else if (team.special.includes("Transport") && this.hqUnit === false) {
                    this.type = team.type;
                }
            }
        }

        remove(team) {
            let index = this.teamIDs.indexOf(team.id);
            if (index > -1) {
                this.teamIDs.splice(index,1);
                if (this.teamIDs.length === 1 && this.hqUnit === true) {
                    let team = TeamArray[this.teamIDs[0]];
                    if (team.special.includes("Transport")) {
                        sendChat("","Remaining Team is Transport and Leaves the Field");
                        team.flees();
                    }
                }
            }
            if (this.teamIDs.length === 0) {
                let formation = FormationArray[this.formationID];
                formation.remove(this);
                if (this.hqUnit === true) {
                    deadHQs[this.player].push(formation.id);
                }
                delete UnitArray[this.id];
            } else if (index === 0) {
                let auraC = team.token.get("aura1_color");
                //change name to Sergeant if isnt a Lt or higher
                let newLeader = TeamArray[this.teamIDs[0]];
                newLeader.name = PromotedName(newLeader,team);
                newLeader.token.set({
                    name: newLeader.name,
                    aura1_color: auraC,
                    tint_color: "transparent",
                })
                newLeader.inCommand = true;
            }
        }

        unpin() {
            let leaderTeam = TeamArray[this.teamIDs[0]];
            leaderTeam.token.set("aura1_color",Colours.green);
            leaderTeam.removeCondition("Pinned");
        }

        pin() {
            let leaderTeam = TeamArray[this.teamIDs[0]];
            leaderTeam.token.set("aura1_color",Colours.yellow);
            leaderTeam.addCondition("Pinned");
        }

        pinned() {
            let result = false;
            let leaderTeam = TeamArray[this.teamIDs[0]];
            if (state.TY.conditions[leaderTeam.id]) {
                if (state.TY.conditions[leaderTeam.id]["Pinned"]) {
                    result = true;
                }
            }
            return result;
        }

        updateTeamIDs() {
            let newTeamIDs = [];
            for (let i=0;i<this.teamIDs.length;i++) {
                let id = this.teamIDs[i];
                let team = TeamArray[id];
                if (!team) {continue};
                newTeamIDs.push(id);
            }
            this.teamIDs = newTeamIDs;
        }

        IC() {
            if (this.hqUnit === true || this.type === "System Unit") {return};
            let unitLeader = TeamArray[this.teamIDs[0]];
            let commandRadius = (this.teamIDs.length < 8) ? 6:8;
            for (let j=0;j<this.teamIDs.length;j++) {
                let team = TeamArray[this.teamIDs[j]];
                if (!team) {continue};
                let dist = team.hex.distance(unitLeader.hex);
                let ic = true;
                if (dist > commandRadius) {
                    ic = false
                } 
                team.IC(ic);
            }
        }

    }

    class Team {
        constructor(tokenID,formationID,unitID) {
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            if (!token) {sendChat("","No Token?"); return}
            let char = getObj("character", token.get("represents")); 
            if (!char) {sendChat("","No Character?"); return}
            let charName = char.get("name");

            let attributeArray = AttributeArray(char.id);
            let nation = attributeArray.nation;
            let player = (WarsawPact.includes(nation)) ? 0:1;
            if (nation === "Neutral") {player = 2};

            let type = attributeArray.type;
            let location = new Point(token.get("left"),token.get("top"));
            let hex = pointToHex(location);
            let hexLabel = hex.label();
            let infoArray = [];

            //create array of weapon info
            let weaponArray = [];
            let artillery;
            let artNum = 0;
            let bestAT = -1;
            let bestFP = 7;
            let bestATWpnNum;
            for (let i=1;i<5;i++) {
                let name = attributeArray["weapon"+i+"name"];
                if (!name || name == " " || name == "") {continue};
                if (name.includes("(") || name.includes(")")) {
                    name = name.replace("(","[");
                    name = name.replace(")","]");
                    AttributeSet(char.id,"weapon"+i+"name",name);
                }
                let fp = attributeArray["weapon"+i+"fp"];
                if (fp === "AUTO") {
                    fp = 1;
                } else {
                    fp = Number(attributeArray["weapon"+i+"fp"].replace(/[^\d]/g, ""));
                }
                let notes = attributeArray["weapon"+i+"notes"];
                if (!notes || notes === "") {notes = " "};

                let halted = attributeArray["weapon"+i+"halted"];
                let moving = attributeArray["weapon"+i+"moving"];

                if (halted !== "Artillery" && halted !== "Salvo") {
                    halted = parseInt(halted);
                }
                if (!halted || halted === "") {halted = 0};

                if (moving !== "Artillery" && moving !== "Salvo") {
                    moving = parseInt(moving);
                }
                if (!moving || moving === "") {moving = 0};

                let rangeText = attributeArray["weapon"+i+"range"];
                rangeText = rangeText.split("-");
                let minRange = 0;
                let maxRange = rangeText[0].replace(/[^\d]/g, "");
                if (rangeText.length > 1) {
                    minRange = rangeText[0].replace(/[^\d]/g, "");
                    maxRange = rangeText[1].replace(/[^\d]/g, "");
                }
                minRange = parseInt(minRange);
                maxRange = parseInt(maxRange);
                let type = attributeArray["weapon"+i+"type"];
                if (!type || type === "") {
                    type = "Small Arms";
                }
                let at = parseInt(attributeArray["weapon"+i+"at"]);
                if (at > bestAT || at === bestAT && fp < bestFP) {
                    bestATWpnNum = (i-1);
                    bestAT = at;
                    bestFP = fp;
                }

                let weapon = {
                    name: name,
                    minRange: minRange,
                    maxRange: maxRange,
                    halted: halted,
                    moving: moving,
                    at: at,
                    fp: fp,
                    notes: notes,
                    type: type,
                }
                if (notes.includes("Heavy Weapon")) {
                    if (special === " ") {
                        special = "Heavy Weapon"
                    } else {
                        special += ",Heavy Weapon";
                    }
                }

                if (notes !== " ") {
                    //puts info on weapon specials on sheet
                    let ws = notes.split(",");
                    for (let s=0;s<ws.length;s++) {
                        let wss = ws[s].trim();
                        infoArray.push(wss);
                    }
                }


                weaponArray.push(weapon);
                if (weapon.halted === "Artillery" || weapon.halted === "Salvo" || weapon.moving === "Artillery" || weapon.moving === "Salvo") {
                    artillery = weapon;
                    artNum = i;
                };
            }

            if (bestAT <= 2) {
                bestATWpnNum = 5; //Hand Grenades
            }

            //update sheet with info
            let specials = attributeArray.special;
            if (!specials || specials === "") {
                specials = " ";
            }
            specials = specials.split(",");
            for (let i=0;i<specials.length;i++) {
                let special = specials[i].trim();
                let attName = "special" + i;
                AttributeSet(char.id,attName,special);
                infoArray.push(special);
            }

            infoArray = [...new Set(infoArray)];

            infoArray.sort(function (a,b) {
                let a1 = a.charAt(0).toLowerCase();
                let b1 = b.charAt(0).toLowerCase();
                if (a1<b1) {return -1};
                if (a1>b1) {return 1};
                return 0;
            });

            for (let i=0;i<10;i++) {
                let specName = infoArray[i];
                if (!specName || specName === "") {continue}
                if (specName.includes("(")) {
                    let index = specName.indexOf("(");
                    specName = specName.substring(0,index);
                    specName += "(X)";
                }
                if (specName.includes("+")) {
                    let index = specName.indexOf("+");
                    specName = specName.substring(0,index);
                    specName += "+X";
                }
                let specInfo = specialInfo[specName];
                if (specName) {
                    specName += ": ";
                }
                if (!specInfo && specName) {
                    specInfo = "Not in Database Yet";
                }
                let atName = "spec" + (i+1) + "Name";
                let atText = "spec" + (i+1) + "Text";

                if (!specName) {
                    DeleteAttribute(char.id,atName);
                } else {
                    AttributeSet(char.id,atName,specName);
                    AttributeSet(char.id,atText,specInfo);
                }
            }

            let special = infoArray.toString();
            if (!special || special === "" || special === " ") {
                special = " ";
            }

            let unique = (attributeArray.unique === "true") ? true:false;

            //armour
            let front = parseInt(attributeArray.armourF);
            let side = attributeArray.armourSR;
            if (side) {side = parseInt(side)} else {side = 0};
            let top = attributeArray.armourT;
            if (top) {top = parseInt(top)} else {top = 0};

            //passengers
            let maxPass = 0;
            if (type === "Tank") {
                maxPass = 3;
            }
            if (special.includes("Transport") || special.includes("Passengers")) {
                let s = special.split(",");
                for (let a=0;a<s.length;a++) {
                    let sub = s[a];
                    if (sub.includes("Passengers")) {
                        maxPass = sub.replace(/[^\d]/g,"");
                        break;
                    }
                }
            }

            let uat = (special.includes("Transport") && (weaponArray.length === 0 || type === "Unarmoured Tank")) ? true:false;

            this.id = tokenID;
            this.token = token;
            this.name = token.get("name");
            this.player = player;
            this.nation = nation;
            this.characterName = charName;
            this.characterID = char.id;
            this.unitID = unitID;
            this.formationID = formationID;
            this.type = type;    
            this.location = location;
            this.prevHexLabel = hexLabel;
            this.prevHex = hex;

            this.order = "";
            this.specialorder = "";
            this.inCommand = true;

            this.tactical = Math.max(0,Math.round(Number(attributeArray.tactical) * gameScale));
            this.terraindash = Math.max(0,Math.round(Number(attributeArray.terrain) * gameScale));
            this.countrydash = Math.max(0,Math.round(Number(attributeArray.country) * gameScale));
            this.roaddash = Math.max(0,Math.round(Number(attributeArray.road) * gameScale));
            this.cross = crossStat(attributeArray.cross);

            //update sheet based on above
            AttributeSet(char.id,"tacticaldisplay",this.tactical);
            AttributeSet(char.id,"terraindisplay",this.terraindash);
            AttributeSet(char.id,"countrydisplay",this.countrydash);
            AttributeSet(char.id,"roaddisplay",this.roaddash);

            this.armourF = front;
            this.armourSR = side;
            this.armourT = top;

            this.motivation = parseStat(attributeArray.motivation);
            this.komissar = parseStat(attributeArray.komissar);
            this.laststand = parse2ndStat(attributeArray.laststand,this.motivation);
            this.rally = parse2ndStat(attributeArray.rally,this.motivation);
            this.counterattack = parse2ndStat(attributeArray.counterattack,this.motivation);
            this.remount = parse2ndStat(attributeArray.remount,this.motivation);
            this.skill = parseStat(attributeArray.skill);
            this.assault = parse2ndStat(attributeArray.assault,this.skill);
            this.tactics = parse2ndStat(attributeArray.tactics,this.skill);
            this.hit = parseStat(attributeArray.hit);
            this.amounted = attributeArray.mountedassault;
            let camounted = "";
            if (attributeArray.counterattackmounted) {
                camounted = attributeArray.counterattackmounted.replace(/[^\d]/g, "");
            }
            this.camounted = camounted

            this.artillery = artillery;
            this.artNum = artNum;
            this.spotAttempts = 0;
            this.rangedInHex = {};
            this.nightvisibility = 0;

            this.hex = hex; //axial
            this.hexLabel = hexLabel; //doubled
            this.rotation = token.get("rotation");
            this.special = special;
            this.unique = unique;

            this.weaponArray = weaponArray;
            this.assaultWpn = bestATWpnNum;
            this.hitArray = [];
            this.eta = [];
            this.shooterIDs = [];
            this.priority = 0;
            this.ccIDs = []; //ids of team in defensive fire range
            this.assaultTargetIDs = []; //ids of teams in CC with
            this.frontLine = false;

            this.bailed = this.queryCondition("Bailed Out");
            this.fired = this.queryCondition("Fired");
            this.aaFired = this.queryCondition("AA Fire");
            this.moved = ((this.queryCondition("Tactical") || this.queryCondition("Dash")) === true) ? true:false;
            this.aaweapon = ''; //used to track weapons fired in AA
            this.gonetoground = this.queryCondition("GTG");

            this.maxPass = maxPass;
            this.passenger = false;
            this.unarmouredTransport = uat;

            if (!state.TY.teams[this.id]) {
                state.TY.teams[this.id] = {
                    unitID: unitID,
                    formationID: formationID,
                }
            }

            TeamArray[tokenID] = this;
            hexMap[hexLabel].teamIDs.push(tokenID);
        }

        addCondition(condition) {
            let imgSrc,charID;
            let rotation = 0;
            let size = 70;
            switch (condition) {
                case 'Bailed Out':
                    imgSrc = Nations[this.nation].pinned;
                    charID = Nations[this.nation].pinnedCharID;
                    rotation = 180;
                    break;
                case 'Pinned':
                    imgSrc = Nations[this.nation].pinned;
                    charID = Nations[this.nation].pinnedCharID;
                    break;
                case 'Dash':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364738371/8Ov_DJPGHECoVdVUaEQG8w/thumb.png?1698192635";
                    charID = "-NhnnimsL_fUE_I44tij";
                    break;
                case 'Tactical':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364738370/zNsS7qwUbv3hWKhHmdhQFw/thumb.png?1698192635";
                    charID = "-Nhno-si_pOx9WcyqX8Q";
                    break;
                case 'Hold':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364740800/zgiEA5heOJag10qcrKWlhA/thumb.png?1698193671";
                    charID = "-Nhno4KrMYcgi0c6_keC";
                    break;
                case 'Assault':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364740790/-PpYtjvGninT5CBZ9cgvcw/thumb.png?1698193663";
                    charID = "-Nhno9pRPTXGOICorXWV";
                    break;
                case 'AAFire':
                    imgSrc =  "https://s3.amazonaws.com/files.d20.io/images/364738389/jQaMAvsc3yfx7tsgMpkZ-Q/thumb.png?1698192640";
                    charID = "-NhnoEpVGQnaSECosUQs";
                    break;
                case 'Fired':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364738390/jRn7kK1dz3EnFwy8lFzyJw/thumb.png?1698192640";
                    charID = "-NhnoJcnvMESfrIA4ipF";
                    break;
                case 'GTG':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364740777/TkNdbvE_My02jE0bkz1KzA/thumb.png?1698193655";
                    charID = "-NhnoOo2ydvrjTOFGMXW";
                    break;
                case 'Radio':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/364839305/-UanVemZgRrwTu3fVijGwA/thumb.png?1698268901";
                    charID = "-NhnoS6WDdovvJrkTeHC";
                    break;
                case 'Passengers':
                    imgSrc = "https://s3.amazonaws.com/files.d20.io/images/365230932/HxeMNYtOiyWDnoyvoa8FCQ/thumb.png?1698516760";
                    charID = "-NhrUN0XxRco5XKwLdSM";
                    size = 40;
                    break;
            }

            let leftConditions = ["Tactical","Dash","Hold","Assault"];
            let rightConditions = ["Fired","AAFire","GTG"];
            let topConditions = [];
            let array = [];
            if (leftConditions.includes(condition)) {
                array = leftConditions;
            } else if (rightConditions.includes(condition)) {
                array = rightConditions;
            } else if (topConditions.includes(condition)) {
                array = topConditions;
            }
            //clear other conditions in that array
            if (state.TY.conditions[this.id]) {
                for (let a=0;a<array.length;a++) {
                    if (state.TY.conditions[this.id][array[a]]) {
                        this.removeCondition(array[a]);
                    }
                }
            } else {
                state.TY.conditions[this.id] = {};
            }

            let conditionToken = createObj("graphic", {   
                left: this.location.x,
                top: this.location.y,
                width: size, 
                height: size,
                rotation: rotation,
                isdrawing: true,
                pageid: this.token.get("pageid"),
                imgsrc: imgSrc,
                layer: "gmlayer",
                represents: charID,
            });
            toFront(conditionToken);
            TokenCondition.AttachConditionToToken(conditionToken.id,this.id);
            state.TY.conditions[this.id][condition] = conditionToken.id;
        }

        removeCondition(condition) {
            if (state.TY.conditions[this.id]) {
                let conditions = state.TY.conditions[this.id];
                if (conditions[condition]) {
                    let conditionID = conditions[condition];
                    let token = findObjs({_type:"graphic", id: conditionID})[0];
                    if (token) {
                        token.remove();
                    }
                    delete state.TY.conditions[this.id][condition];
                }
            }
        }

        queryCondition(condition) {
            let result = false;
            if (state.TY.conditions[this.id]) {
                let conditions = state.TY.conditions[this.id];
                if (conditions[condition]) {
                    result = true;
                }
            }
            return result;  
        }

        BailOut() {
            let result = {
                result: "",
                tip: "",
            }
            if (this.bailed === true) {
                let roll = randomInteger(6);
                let reroll = CommandReroll(this);
                result.tip = "<br>Remount Roll: " + roll + " vs. " + this.remount + "+";
                if (roll < this.remount && reroll !== -1) {
                    result.tip += "<br>Reroll from Formation Commander: " + reroll;
                }
                roll = Math.max(roll,reroll);  
                if (roll >= this.remount) {
                    result.result = "bailedAgain"
                } else {
                    result.result = "flees"
                }
            } else {
                result.result = "bailed";
                this.bail();
            }
            return result;
        }

        bail() {
            this.addCondition("Bailed Out");
            this.bailed = true;
        }

        remountTank() {
            this.removeCondition("Bailed Out");
            this.bailed = false;
        }

        IC(ic) {
            this.inCommand = ic;
            let colour = "transparent";
            if (ic === false) {
                colour = Colours.black;
            }
            this.token.set("tint_color",colour);
        }
    
        Save(hit,hitNum) {
log(hit)
            let facing = hit.facing;
            let range = hit.range;
            let bp = hit.bp;
            let weapon = hit.weapon;
            let rangedIn = hit.rangedIn;
            let shooterType = hit.shooterType;
            let closeCombat = hit.closeCombat;
            if (!hit.closeCombat) {closeCombat = false};

            let notes = weapon.notes;
            let saveRoll = randomInteger(6);
            let fpRoll = randomInteger(6);
            let saveNeeded = 0;
            let save = {
                result: "",
                tip: hitNum + ": ",
            }

            if (bp === "Artillery") {
                bp = hexMap[this.hexLabel].bp;
                if (hexMap[this.hexLabel].foxholes === true && this.type === "Infantry") {bp = true};
            } 
            if (bp === "Passenger") {
                bp = false;
            }

            if (this.special.includes("Redemption")) {
                bp = false;
            }

            if (this.type === "Tank") {
                if (weapon.type === "Flamethrower") {
                    facing = "Top";
                }

                if (facing === "Front") {saveNeeded = this.armourF};
                if (facing === "Side/Rear") {saveNeeded = this.armourSR};
                if (facing === "Top") {saveNeeded = this.armourT};

                saveNeeded = parseInt(saveNeeded);

                if (this.special.includes("Skirts") && hit.weapon.notes.includes("HEAT") && facing !== "Top") {
                    saveNeeded = Math.max(saveNeeded,10);
                }
                if ((this.special.includes("BDD") || this.special.includes("Applique")) && hit.weapon.notes.includes("HEAT") && facing !== "Top") {
                    saveNeeded = Math.max(saveNeeded,13);
                }
                if (this.special.includes("Chobham") && hit.weapon.notes.includes("HEAT") && facing !== "Top") {
                    saveNeeded = Math.max(saveNeeded,16);
                }
                if (this.special.includes("ERA") && hit.weapon.notes.includes("HEAT") && facing !== "Top" && hit.weapon.notes.includes("Tandem") === false) {
                    saveNeeded = Math.max(saveNeeded,16);
                }

                if (range > 16 && weapon.notes.includes("HEAT") === false && weapon.notes.includes("Krasnopol") === false) {
                    saveNeeded += 1;
                    save.tip += "<br>+1 Armour for Long Range<br>";
                };

                let armourSave = saveRoll + saveNeeded;

                save.tip += "Antitank " + weapon.at + " vs. ";
                save.tip += "<br>" + facing + " Armour: " + saveNeeded + " + Save Roll: " + saveRoll;

                if (weapon.at > (saveNeeded + 6)) {
                    save.tip = hitNum + ": Auto -  AT " + weapon.at + " vs Armour: " + saveNeeded;
                }

                if ((saveNeeded + 1) > weapon.at) {
                    save.tip = hitNum + ": Bounce - Armour: " + saveNeeded + " vs AT " + weapon.at;
                    PlaySound("Ricochet")
                }

                if (armourSave > weapon.at) {
                    save.result = "deflect";
                    PlaySound("Ricochet")
                } else if (armourSave === weapon.at) {
                    save.tip += "<br>Firepower Roll: " + fpRoll + " vs. " + weapon.fp + "+"; 
                    if (fpRoll < weapon.fp) {
                        save.result = "minor"
                    } else {
                        let result = this.BailOut();
                        PlaySound("Hit");
                        save.result = result.result;
                        save.tip += result.tip;
                        if (result.result === "flees") {save.tip = "*" + save.tip}
                    }           
                } else {
                    save.tip += "<br>Firepower Roll: " + fpRoll + " vs. " + weapon.fp + "+"; 
                    if (fpRoll < weapon.fp) {
                        let result = this.BailOut();
                        save.result = result.result;
                        save.tip += result.tip;
                        if (result.result === "flees" && save.tip.charAt(0) != "💀") {
                            save.tip = "💀" + save.tip
                        }
                    } else {
                        if (save.tip.charAt(0) != "💀") {
                            save.tip = "💀" + save.tip
                        }
                        save.result = "destroyed";
                    }
                }
            } else if (this.type === "Infantry" || this.type === "Unarmoured Tank" || this.type === "Gun") {
                if (this.special.includes("Gun Shield") && facing === front && this.order !== "Dash" && bp !== "Artillery") {
                    bp = true;
                }

                saveNeeded = parseInt(this.armourF);
                if (closeCombat === true) {
                    saveNeeded = 7;
                }
                save.tip = hitNum + ": Save Roll: " + saveRoll + " vs. " + saveNeeded + "+";
                if (saveNeeded === 7) {
                    save.tip = hitNum + ": No Save";
                }
                if (rangedIn && this.type === "Infantry" && saveRoll >= saveNeeded) {
                    //reroll passed saves on rangedIn artillery for infantry
                    saveRoll = randomInteger(6);
                    save.tip += "<br>Rerolled due to RangedIn: " + saveRoll;
                }
                if (notes.includes("Brutal") && saveRoll >= saveNeeded) {
                    //reroll passed saves for brutal weapons
                    saveRoll = randomInteger(6);
                    save.tip += "<br>Rerolled due to Brutal Weapon: " + saveRoll;
                }
                if ((weapon.type === "Flamethrower" || notes.includes("Flame-thrower")) && saveRoll >= saveNeeded) {
                    //reroll passed saves for flamethrowers
                    saveRoll = randomInteger(6);
                    save.tip += "<br>Rerolled due to Flamethrower: " + saveRoll;
                }
                if (saveRoll >= saveNeeded) {
                    save.result = "saved";
                } else if (bp === true && this.type !== "Unarmoured Tank") {
                    save.tip += "<br>Firepower Roll: " + fpRoll + " vs. " + weapon.fp + "+";
                    if (fpRoll < weapon.fp) {
                        save.result = "cover";
                    } else {
                        if (save.tip.charAt(0) != "💀") {
                            save.tip = "💀" + save.tip
                        }
                        save.result = "destroyed";
                    }
                } else {
                    if (save.tip.charAt(0) != "💀") {
                        save.tip = "💀" + save.tip
                    }                    
                    save.result = "destroyed";
                }
            } else if (this.type === "Aircraft" || this.type === "Helicopter") {
                //only weapons capable of targetting aircraft/helos should make it to here
                saveNeeded = parseInt(this.armourF);
                save.tip = hitNum + ": Save Roll: " + saveRoll + " vs. " + saveNeeded + "+";
                if (saveRoll >= saveNeeded) {
                    save.result = "saved";
                } else {
                    save.tip += "<br>Firepower Roll: " + fpRoll + " vs. " + weapon.fp + "+";
                    let noRerollWeapons = ["Guided","Guided AA","Anti-helicopter","Dedicated AA"];
                    let notes = weapon.notes.split(",");
                    if (((shooterType === "Infantry" && findCommonElements(noRerollWeapons,notes) === false) || weapon.type === "AA MG") && fpRoll >= weapon.fp) {
                        fpRoll = randomInteger(6);
                        save.tip += "<br>Rerolled: " + fpRoll;
                    }
                    if (fpRoll < weapon.fp) {
                        save.result = "minor";
                    } else {
                        if (save.tip.charAt(0) != "💀") {
                            save.tip = "💀" + save.tip
                        }
                        save.result = "destroyed";
                    }
                } 
            }
            return save;
        }


        kill() {
            if (this.type === "Tank" || this.type === "Helicopter") {
                this.wreck();
                PlaySound("Explosion")
            } else {
                this.token.set({
                    layer: "map",
                    statusmarkers: "dead",
                });
            }

            toFront(this.token);
            if (state.TY.conditions[this.id]) {
                let keys = Object.keys(state.TY.conditions[this.id]);
                for (let i=0;i<keys.length;i++) {
                    this.removeCondition(keys[i]);
                }
            }
            UnitArray[this.unitID].remove(this);
            delete TeamArray[this.id];
        }

        flees() {
            UnitArray[this.unitID].remove(this);
            if (this.bailed === true) {
                this.wreck();
            } else {
                this.token.remove();
            }
            delete TeamArray[this.id];
        }

        wreck() {
            let tok = this.token;
            if (!tok) {return};
            tok.set("name","WRECK")
            tok.set("showname",false)
            tok.set("layer","map")
            tok.set("statusmarkers","");
            tok.set("aura1_color","transparent");
            tok.set("tint_color","transparent");
            let y = tok.get('top') - 33
            let img = "https://s3.amazonaws.com/files.d20.io/images/250890242/TNggOuyBFT67qEPS1nxIPg/thumb.png?1634484854"
            let x = tok.get("left") + 30
            if (randomInteger(2) === 2) {
                img = "https://s3.amazonaws.com/files.d20.io/images/250892520/gL4-_C7Y7-cYDKW9icsUcg/thumb.png?1634485587"
                x = tok.get("left") + 10
            }
            let newToken = createObj("graphic", {   
                left: x,
                top: y,
                width: 70, 
                height: 70,  
                name: "vehiclefire",
                isdrawing: true,
                pageid: tok.get("pageid"),
                imgsrc: img,
                layer: "map",
            });
            toFront(newToken);

            hexMap[this.hexLabel].terrain.push("Wreck");
            hexMap[this.hexLabel].bp = true;
            if (hexMap[this.hexLabel].type === 0) {
                hexMap[this.hexLabel].type = 1;
            }

        }




    }












    //Various Routines
    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    }

    const findCommonElements = (arr1,arr2) => {
        //iterates through array 1 and sees if array 2 has any of its elements
        //returns true if the arrays share an element
        return arr1.some(item => arr2.includes(item));
    }

    const returnCommonElements = (array1,array2) => {
        return array1.filter(value => array2.includes(value));
    }

    const simpleObj = (o) => {
        p = JSON.parse(JSON.stringify(o));
        return p;
    }

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    }

    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    }

    const Attribute = (character,attributename) => {
        //Retrieve Values from Character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    }

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;

        }
        return aa;
    }

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        if (!newvalue) {newvalue = 0};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
    }

    const ButtonInfo = (phrase,action) => {
        let info = {
            phrase: phrase,
            action: action,
        }
        outputCard.buttons.push(info);
    }

    const SetupCard = (title,subtitle,nation) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.nation = nation;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    }

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    }

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

    const FX = (fxname,team1,team2) => {
        //team2 is target, team1 is shooter
        //if its an area effect, team1 isnt used
        if (fxname.includes("System")) {
            //system fx
            fxname = fxname.replace("System-","");
            if (fxname.includes("Blast")) {
                fxname = fxname.replace("Blast-","");
                spawnFx(team2.location.x,team2.location.y, fxname);
            } else {
                spawnFxBetweenPoints(team1.location, team2.location, fxname);
            }
        } else {
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(team1.location, team2.location, fxType.id);
            }
        }
    }

    const Unique = (array,label) => {
        //eliminate duplicate objects in array using a label eg. name if sorting on obj.name
        array = array.reduce((unique, o) => {
            if(!unique.some(obj => obj[label] === o[label])) {
              unique.push(o);
            }
            return unique;
        },[]);
        return array;
    }

    const getAbsoluteControlPt = (controlArray, centre, w, h, rot, scaleX, scaleY) => {
        let len = controlArray.length;
        let point = new Point(controlArray[len-2], controlArray[len-1]);
        //translate relative x,y to actual x,y 
        point.x = scaleX*point.x + centre.x - (scaleX * w/2);
        point.y = scaleY*point.y + centre.y - (scaleY * h/2);
        point = RotatePoint(centre.x, centre.y, rot, point);
        return point;
    }

    const XHEX = (pts) => {
        //makes a small group of points for checking around centre
        let points = pts;
        points.push(new Point(pts[0].x - 20,pts[0].y - 20));
        points.push(new Point(pts[0].x + 20,pts[0].y - 20));
        points.push(new Point(pts[0].x + 20,pts[0].y + 20));
        points.push(new Point(pts[0].x - 20,pts[0].y + 20));
        return points;
    }

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta > 360) {
            theta -= 360;
        }
        return theta
    }   

    const RotatePoint = (cX,cY,angle, p) => {
        //cx, cy = coordinates of the centre of rotation
        //angle = clockwise rotation angle
        //p = point object
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        p.x -= cX;
        p.y -= cY;
        // rotate point
        let newX = p.x * c - p.y * s;
        let newY = p.x * s + p.y * c;
        // translate point back:
        p.x = Math.round(newX + cX);
        p.y = Math.round(newY + cY);
        return p;
    }

    const pointInPolygon = (point,polygon) => {
        //evaluate if point is in the polygon
        px = point.x
        py = point.y
        collision = false
        vertices = polygon.vertices
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }

    const TokenVertices = (tok) => {
        //Create corners with final being the first
        let corners = []
        let tokX = tok.get("left")
        let tokY = tok.get("top")
        let w = tok.get("width")
        let h = tok.get("height")
        let rot = tok.get("rotation") * (Math.PI/180)
        //define the four corners of the target token as new points
        //also rotate those corners around the target tok centre
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY-h/2 )))     //Upper right
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY+h/2 )))     //Lower right
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY+h/2 )))     //Lower left
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
        return corners
      }

      const Name = (nat) => {
        let num = randomInteger(25) - 1;
        if (nat === "Canadian") {nat = "UK"};
        if (nat.includes("SS")) {nat = "Germany"};
        let names = {
            Germany: ["Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Bauer","Richter","Klein","Wolf","Schroder","Neumann","Schwarz","Braun","Hofmann","Werner","Krause","Konig","Lang","Vogel","Frank","Beck"],
            Soviet: ["Ivanov","Smirnov","Petrov","Sidorov","Popov","Vassiliev","Sokolov","Novikov","Volkov","Alekseev","Lebedev","Pavlov","Kozlov","Orlov","Makarov","Nikitin","Zaitsev","Golubev","Tarasov","Ilyin","Gusev","Titov","Kuzmin","Kiselyov","Belov"],
            USA: ["Smith","Johnson","Williams","Brown","Jones","Wright","Miller","Davis","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Clark","Lewis","Robinson","Walker","Young","Allen"],
            UK: ["Smith","Jones","Williams","Taylor","Davies","Brown","Wilson","Evans","Thomas","Johnson","Roberts","Walker","Wright","Robinson","Thompson","White","Hughes","Edwards","Green","Lewis","Wood","Harris","Martin","Jackson","Clarke"],
        }

        let nameList = names[nat];
        let surname = nameList[num];
        return surname;
    }

    const teamHeight = (team) => {
        //height of token based on terrain, with additional based on type
        let hex = hexMap[team.hexLabel];
        let height = parseInt(hex.elevation);
        if (team.type === "Infantry" && hex.terrain.includes("Building")) {
            height = parseInt(hex.height) - 1;
        } 
        if (team.type === "Aircraft") {
            height += 20;
        }
        return height;
    }

    const ClearState = () => {
        //clear arrays
        UnitArray = {};
        TeamArray = {};
        FormationArray = {};

        SmokeArray = {};
        FoxholeArray = [];
        
        RemoveDead("All");

        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });

        tokens.forEach((token) => {
            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                showname: true,
                showplayers_aura1: true,
                gmnotes: "",
                statusmarkers: "",
            });                
        })

        state.TY = {
            nations: [[],[]],
            players: {},
            playerInfo: [[],[]],
            lineArray: [],
            labmode: false,
            darkness: false,
            turn: 0,
            step: "start",
            gametype: "undefined",
            currentPlayer: undefined,
            timeOfDay: "Day",
            startingPlayer: undefined,
            barrageID: "",
            BarrageInfo: [],
            smokeScreens: [[],[]],
            conditions: {},
            teams: {}, //teamIDs -> unit and formation IDs
            formations: {}, //formationIDs -> name
            units: {},//unitIDs -> name
            passengers: {},//keyed on IDs of transports, arrays of passengerIDs
        }
        BuildMap();
        sendChat("","Cleared State/Arrays");
    }

    const RemoveDead = (info) => {
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
        });

        let removals = ["SmokeScreen","rangedin","Foxholes","Smoke"];
        tokens.forEach((token) => {
            let layer = token.get("layer");
            if (token.get("status_dead") === true) {
                token.remove();
            }
            for (let i=0;i<removals.length;i++) {
                if (removals[i] === token.get("name") && info === "All") {
                    token.remove();
                }
            }
            if ((layer === "gmlayer" || layer === "walls") && info === "All") {
                token.remove();
            }
        });
    }

    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.nation || !Nations[outputCard.nation]) {
            outputCard.nation = "Neutral";
        }
log(outputCard)
        if (!outputCard.title) {outputCard.title = "No Title, Check Log"}

        //start of card
        output += `<div style="display: table; border: ` + Nations[outputCard.nation].borderStyle + " " + Nations[outputCard.nation].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: centre; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Nations[outputCard.nation].backgroundColour + `; `;
        output += `background-image: url(` + Nations[outputCard.nation].image + `), url(` + Nations[outputCard.nation].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: centre,centre; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: centre;"><span style="`;
        output += `font-family: ` + Nations[outputCard.nation].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Nations[outputCard.nation].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Nations[outputCard.nation].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Nations[outputCard.nation].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:centre; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack = (i % 2 === 0) ? "#D3D3D3" : "#EEEEEE";
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let out = "";
                let info = outputCard.buttons[i];
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + Nations[outputCard.nation].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a></div></span></div></div>`;
                output += out;
            }
        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: [],};
    }

    const parseStat = (x) => {
        if (x) {
            p = x.replace(/[^\d]/g, "");
        }
        if (isNaN(p)) {
            p = 7;
        }
        return p;
    }

    const parse2ndStat = (x,y) => {
        let p = parseInt(y);
        if (x) {
            p = x.replace(/[^\d]/g, "");
        }
        if (isNaN(p)) {
            p = parseInt(y);
        }
        return p;
    }

    const crossStat = (x) => {
        let c = 1;
        if (x) {
            c = parseInt(x);
            if (isNaN(c)) {c = 1};
        }
        return c;
    }

    const Rank = (nat,j) => {
        if (nat === "UK" || nat === "Canadian" || nat === "USA") {nat = "Western"};        
        let rank = Ranks[nat][j];
        return rank
    }


    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;

        pageInfo.page.set("gm_opacity",1);

        HexInfo.directions = {
            "Northeast": new Hex(1, -1, 0),
            "East": new Hex(1, 0, -1),
            "Southeast": new Hex(0, 1, -1),
            "Southwest": new Hex(-1, 1, 0),
            "West": new Hex(-1, 0, 1),
            "Northwest": new Hex(0, -1, 1),
        }

        let edges = findObjs({_pageid: Campaign().get("playerpageid"),_type: "path",layer: "map",stroke: "#d5a6bd",});
        let c = pageInfo.width/2;
        for (let i=0;i<edges.length;i++) {
            edgeArray.push(edges[i].get("left"));
        }
        if (edgeArray.length === 0) {
            sendChat("","Add Edge(s) to map and reload API");
            return;
        } else if (edgeArray.length === 1) {
            if (edgeArray[0] < c) {
                edgeArray.push(pageInfo.width)
            } else {
                edgeArray.unshift(0);
            }
        } else if (edgeArray.length === 2) {
            edgeArray.sort((a,b) => parseInt(a) - parseInt(b));
        } else if (edgeArray.length > 2) {
            sendChat("","Error with > 2 edges, Fix and Reload API");
            return
        }
    }


    const BuildMap = () => {
        let startTime = Date.now();
        hexMap = {};
        //builds a hex map, assumes Hex(V) page setting
        let halfToggleX = HexInfo.halfX;
        let rowLabelNum = 0;
        let columnLabel = 1;
        let startX = xSpacing/2;
        let startY = 43.8658278242683;

        for (let j = startY; j <= pageInfo.height;j+=ySpacing){
            let rowLabel = rowLabels[rowLabelNum];
            for (let i = startX;i<= pageInfo.width;i+=xSpacing) {
                let point = new Point(i,j);     
                let label = (rowLabel + columnLabel).toString(); //id of hex
                let hexInfo = {
                    id: label,
                    centre: point,
                    terrain: [], //array of names of terrain in hex
                    terrainIDs: [], //used to see if tokens in same building or such
                    teamIDs: [], //ids of tokens in hex
                    elevation: 0, //based on hills
                    height: 0, //height of top of terrain over elevation
                    smoke: false,
                    smokescreen: false,
                    foxholes: false,
                    type: 0,
                    bp: false,
                    dash: "Country",
                };
                hexMap[label] = hexInfo;
                columnLabel += 2;
            }
            startX += halfToggleX;
            halfToggleX = -halfToggleX;
            rowLabelNum += 1;
            columnLabel = (columnLabel % 2 === 0) ? 1:2; //swaps odd and even
        }
    
        BuildTerrainArray();

        let taKeys = Object.keys(TerrainArray);
        for (let i=0;i<taKeys.length;i++) {
            let polygon = TerrainArray[taKeys[i]];
            if (polygon.linear === false) {continue};
            Linear(polygon);
        }

        let keys = Object.keys(hexMap);
        const burndown = () => {
            let key = keys.shift();
            if (key){
                let c = hexMap[key].centre;
                if (c.x >= edgeArray[1] || c.x <= edgeArray[0]) {
                    //Offboard
                    hexMap[key].terrain = ["Offboard"];
                } else {
                    let temp = DeepCopy(hexMap[key]);
                    for (let t=0;t<taKeys.length;t++) {
                        let polygon = TerrainArray[taKeys[t]];
                        if (!polygon) {continue};
                        if (temp.terrain.includes(polygon.name) || polygon.linear === true) {continue};
                        let check = false;
                        let pts = [];
                        pts.push(c);
                        pts = XHEX(pts);
                        let num = 0;
                        for (let i=0;i<5;i++) {
                            check = pointInPolygon(pts[i],polygon);
                            if (i === 0 && check === true) {
                                //centre pt is in hex, can skip rest
                                num = 3;
                                break;
                            }
                            if (check === true) {num ++};
                        }
                        if (num > 2) {
                            temp.terrain.push(polygon.name);
                            temp.terrainIDs.push(polygon.id);
                            if (polygon.name.includes("Smoke")) {
                                temp.smoke = true;
                                if (polygon.name === "SmokeScreen") {
                                    temp.smokescreen = true;
                                }
                                let sInfo = {
                                    hex: key,
                                    id: polygon.tokenID, 
                                    player: polygon.gmnotes,
                                }
                                SmokeArray.push(sInfo); 
                            }
                            if (polygon.name === "Foxholes") {
                                let fInfo = {
                                    hex: key,
                                    id: polygon.id, //id of the Foxhole token, can be used to remove later
                                }
                                FoxholeArray[key] = fInfo;
                                temp.foxholes = true;
                            }
                            if (polygon.name === "rangedin") {
                                let rInfo = {
                                    hex: key,
                                    id: polygon.id,
                                }
                                RangedInArray[polygon.gmnotes] = rInfo; 
                            }

                            if (polygon.bp === true) {temp.bp = true};

                            temp.dash = Math.max(temp.dash,polygon.dash);

                            if (polygon.name.includes("Hill")) {
                                temp.elevation = Math.max(temp.elevation,polygon.height);
                                temp.height = Math.max(temp.elevation,polygon.height)
                            } else {
                                temp.height = Math.max(temp.height,polygon.height);
                                temp.type = Math.max(temp.type,polygon.type);
                            };
                        };
                    };
                    if (temp.terrain.length === 0) {
                        temp.terrain.push("Open Ground");
                    }
                    hexMap[key] = temp;
                }
                setTimeout(burndown,0);
            }
        }
        burndown();

        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
        //add tokens to hex map, rebuild Team/Unit Arrays
        RebuildArrays();
        //check what is in command
        inCommand("All");
        BuildReserve();//places flag on units in reserve when rebuilding a map
    }

    const BuildTerrainArray = () => {
        TerrainArray = {};
        //first look for graphic lines outlining hills etc
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "path",layer: "map"});
        paths.forEach((pathObj) => {
            let vertices = [];
            toFront(pathObj);
            let colour = pathObj.get("stroke").toLowerCase();
            let t = TerrainInfo[colour];
            if (!t) {return};  
            let path = JSON.parse(pathObj.get("path"));
            let centre = new Point(pathObj.get("left"), pathObj.get("top"));
            let w = pathObj.get("width");
            let h = pathObj.get("height");
            let rot = pathObj.get("rotation");
            let scaleX = pathObj.get("scaleX");
            let scaleY = pathObj.get("scaleY");

            //covert path vertices from relative coords to actual map coords
            path.forEach((vert) => {
                let tempPt = getAbsoluteControlPt(vert, centre, w, h, rot, scaleX, scaleY);
                if (isNaN(tempPt.x) || isNaN(tempPt.y)) {return}
                vertices.push(tempPt);            
            });
            let id = stringGen();
            if (TerrainArray[id]) {
                id += stringGen();
            }
            let linear = (t.name === "Ridgeline") ? true:false;

            let info = {
                name: t.name,
                id: id,
                vertices: vertices,
                centre: centre,
                height: t.height,
                bp: t.bp,
                type: t.type,
                group: t.group,
                obstacle: t.obstacle,
                linear: linear,
                dash: t.dash,
            };
            TerrainArray[id] = info;
        });
        //add tokens on map eg woods, crops
        let mta = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        mta.forEach((token) => {
            let truncName = token.get("name").toLowerCase();
            truncName = truncName.trim();
            let t = MapTokenInfo[truncName];
            if (!t) {
                return;
            };

            let vertices = TokenVertices(token);
            let centre = new Point(token.get('left'),token.get('top'));
            let id = stringGen();
            if (TerrainArray[id]) {
                id += stringGen();
            }
            let info = {
                name: t.name,
                id: id,
                tokenID: t.id,
                gmnotes: decodeURIComponent(token.get("gmnotes")),
                vertices: vertices,
                centre: centre,
                height: t.height,
                bp: t.bp,
                type: t.type,
                group: t.group,
                obstacle: t.obstacle,
                linear: false,
                dash: t.dash,
            };
            TerrainArray[id] = info;
        });
    };

    const Linear = (polygon) => {
        //adds linear obstacles, eg Ridgelines, to hex map
        let vertices = polygon.vertices;
        for (let i=0;i<(vertices.length - 1);i++) {
            let hexes = [];
            let pt1 = vertices[i];
            let pt2 = vertices[i+1];
            let hex1 = pointToHex(pt1);
            let hex2 = pointToHex(pt2);
            hexes = hex1.linedraw(hex2);
            for (let j=0;j<hexes.length;j++) {
                let hex = hexes[j];
                let hexLabel = hex.label();
                if (!hexMap[hexLabel]) {continue};
                if (hexMap[hexLabel].terrain.includes(polygon.name)) {continue};
                hexMap[hexLabel].terrain.push(polygon.name);
                hexMap[hexLabel].terrainIDs.push(polygon.id);
                hexMap[hexLabel].los = Math.max(hexMap[hexLabel].los,polygon.los);
                hexMap[hexLabel].cover = Math.max(hexMap[hexLabel].cover,polygon.cover);
                hexMap[hexLabel].move = Math.max(hexMap[hexLabel].move,polygon.move);
                hexMap[hexLabel].obstacle = Math.max(hexMap[hexLabel].obstacle,polygon.obstacle);
                hexMap[hexLabel].height = Math.max(hexMap[hexLabel].height,polygon.height);
                if (polygon.cover === 2) {
                    hexMap[hexLabel].coverID = polygon.id
                }
            }
        }
    }

    const RebuildArrays = () => {
        UnitArray = {};
        TeamArray = {};
        FormationArray = {};
        let startTime = Date.now();
        if (!state.TY.teams) {
            log("No Teams in Array")
            return;
        }

        let add = 0;
        let remove = 0;

        let teamKeys = Object.keys(state.TY.teams);
        for (let i=0;i<teamKeys.length;i++) {
            let id = teamKeys[i];
            let token = findObjs({_type:"graphic", id: id})[0];
            if (!token) {
                delete state.TY.teams[id];
                remove++;
                continue;
            }
            let character =  getObj("character", token.get("represents")); 
            if (!character) {
                continue;
            }
            let nation = Attribute(character,"nation");

            let teamInfo = state.TY.teams[id];
            let fid = teamInfo.formationID;
            let uid = teamInfo.unitID;

            let fName = state.TY.formations[fid];
            let uName = state.TY.units[uid];

            let formation,unit,team;
            if (!FormationArray[fid]) {
                formation = new Formation(nation,fid,fName);
            } else {
                formation = FormationArray[fid];
            }
            if (!UnitArray[uid]) {
                unit = new Unit(nation,uid,uName,fid);
                formation.add(unit);
            } else {
                unit = UnitArray[uid];
            }
            team = new Team(id,fid,uid);

            unit.add(team);
            add++;
        }
        let elapsed = Date.now()-startTime;
        log(add + " Teams added to array in " + elapsed/1000 + " seconds");
        if (remove > 0) {
            log(remove + " Teams removed from Array as no Token");
        }
    }

    const Facing = (id1,id2) => { //id2 is the target, id1 is the shooter - returns the facing of id 2
        let facing = "Front";
        let team1 = TeamArray[id1];
        let vertices1 = TokenVertices(team1.token);
        let team2 = TeamArray[id2];
        let vertices2 = TokenVertices(team2.token);
        //top corners of target, to define its front line
        let A = vertices2[0];    //Upper left
        let B = vertices2[1];    //Upper right
        //  center of the target token
        let C2 = team2.location;
        let D = ((C2.x - A.x) * (B.y - A.y)) - ((C2.y - A.y) * (B.x - A.x)) //for the target - where front line is relative to centre
        D = Math.sign(D)
        //D will be (-) if on one side, (+) if on other of front line
        // for reference use vertices of shooter
        for (let i=0;i<4;i++) {
            let C1 = vertices1[i]
            // https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
            let E = ((C1.x - A.x) * (B.y - A.y)) - ((C1.y - A.y) * (B.x - A.x)) //for the shooter - where vertice is relative to front line of target
            E = Math.sign(E)
            //E will be (-) or (+) based on which side of front line, and if E is same sign as D is on same side as centre ie. behind front line
            if (D===E || E === 0) {
                facing = "Side/Rear"
                break;
            } 
        }
        return facing
    }

    const UnitCreation = (msg) => {
        if (!msg.selected) {return};
        let Tag = msg.content.split(";");
        let unitName = Tag[1];
        let teamIDs = [];
        for (let i=0;i<msg.selected.length;i++) {
            teamIDs.push(msg.selected[i]._id);
        }
        let refToken = findObjs({_type:"graphic", id: teamIDs[0]})[0];
        let refChar = getObj("character", refToken.get("represents")); 
        if (!refChar) {
            sendChat("","Error, NonCharacter Token");
            return;
        }
        let nation = Attribute(refChar,"nation");

        let formationKeys = Object.keys(FormationArray);
        let supportFlag = false;
        if (formationKeys.length > 0) {
            for (let i=0;i<formationKeys.length;i++) {
                let formation = FormationArray[formationKeys[i]];
                if (formation.nation !== nation) {continue}
                if (formation.name === "Support") {
                    supportFlag = true;
                    break;
                }
            }
        }

        if (supportFlag === false) {
            support = new Formation(nation,stringGen(),"Support");
        }

        let newID = stringGen();
        SetupCard("Unit Creation","",nation);
        outputCard.body.push("Select Existing Formation or New");

        ButtonInfo("New","!UnitCreation2;" + newID + ";?{Formation Name}");
        formationKeys = Object.keys(FormationArray); //redone as Support may have been added

        for (let i=0;i<formationKeys.length;i++) {
            let formation = FormationArray[formationKeys[i]];
            if (formation.nation !== nation) {continue};
            let action = "!UnitCreation2;" + formation.id;
            ButtonInfo(formation.name,action);
        }

        PrintCard();

        unitCreationInfo = {
            nation: nation,
            newID: newID,
            teamIDs: teamIDs,
            unitName: unitName,
        }
    }

    const UnitCreation2 = (msg) => {
        let Tag = msg.content.split(";");
        let unitName = unitCreationInfo.unitName;
        let nation = unitCreationInfo.nation;
        let player = (WarsawPact.includes(nation)) ? 0:1;
        let teamIDs = unitCreationInfo.teamIDs;
        let formationID = Tag[1];
        let formation = FormationArray[formationID];

        if (!formation) {
            formation = new Formation(nation,formationID,Tag[2]);
        }
        let unit = new Unit(nation,stringGen(),unitName,formationID);

        unit.number = formation.unitIDs.length;
        let unitMarker = Nations[nation].platoonmarkers[unit.number];
        formation.add(unit);

        log(formation)
        log(unit)

        for (let i=0;i<teamIDs.length;i++) {
            let team = new Team(teamIDs[i],formationID,unit.id);
            if (!team) {continue};
            unit.add(team);
            let aura = "transparent";
            if (i === 0) {
                aura = Colours.green
            };
            let name = NameAndRank(team,i);
            team.name = name;
            let r = 0.1;
            if (team.type === "Infantry") {r = 0.25}
            team.token.set({
                name: name,
                tint_color: "transparent",
                aura1_color: aura,
                aura1_radius: r,
                showname: true,
                statusmarkers: unitMarker,
            })
        }
        if (state.TY.nations[player].includes(nation) === false) {
            state.TY.nations[player].push(nation);
        }
        sendChat("",unitName + " Added to " + formation.name)
    }

    const NameAndRank = (team,i) => {
        let name = team.characterName.replace(team.nation + " ","");
        let unit = UnitArray[team.unitID];
        if (team.type.includes("Tank")) {
            name = name.replace(team.nation + " ","");
            let item = ((unit.number+1) * 100) + i
            name += " " + item.toString();
        } else if (team.type === "Infantry" || team.type === "Gun") {
            name += " "+ i;
        } 
        let rank;
        if (team.special.includes("HQ") || team.token.get(SM.HQ) === true) {
            rank = Math.min(i,1);
            unit.hqUnit = true;
            name = Rank(team.nation,rank) + Name(team.nation);
        } else {
            if (team.type === "Aircraft" || team.special.includes("Independent")) {
                rank = 2;
                unit.aircraft = true;
                if (team.nation === "Soviet") {rank=3};
                name = Rank(team.nation,rank) + Name(team.nation);
            } else if (name.includes("Komissar")) {
                name = "Komissar " + Name(team.nation);
            } else if (i === 0) {
                rank = 2;
                if (team.nation === "Soviet" && unit.artillery === true) {rank=3};
                name = Rank(team.nation,rank) + Name(team.nation);
            } 
        }
        return name;
    }

    const PromotedName = (team,oldTeam) => {
        let name = team.name;
        if (!oldTeam) {oldTeam = " "};
        let subNames = name.split(" ");
        let nat = team.nation;
        if (nat === "UK" || nat === "Canadian" || nat === "USA") {nat = "Western"};   
        let ranks = Ranks[nat];
        if (ranks.includes(subNames[0]) === false) {
            if (team.nation === "Soviet" && oldTeam.name.includes("Kapitan")) {
                name = ranks[ranks.length - 2] + " " + Name(team.nation);
            } else {
                name = ranks[ranks.length - 1] + " " + Name(team.nation);
            }
        }
        return name;
    }


    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let data = TokenCondition.LookUpMaster(id);
        if (data) {
            id = data.target;
        }

        let team = TeamArray[id];
        if (!team) {
            sendChat("","Not in Team Array Yet");
            return;
        };
        let nation  = team.nation;
        if (!nation) {nation = "Neutral"};
        SetupCard(team.name,"Hex: " + team.hexLabel,nation);
        let h = hexMap[team.hexLabel];
        log("Team IDs: " + h.teamIDs)

        let terrain = h.terrain;
        terrain = terrain.toString();
        let elevation = teamHeight(team);
        let unit = UnitArray[team.unitID];
        outputCard.body.push("Terrain: " + terrain);
        let covers = ["Flat Terrain","Short Terrain","Tall Terrain","a Building"];
        outputCard.body.push(team.name + " is in " + covers[h.type]);
        if (h.bp === true || h.foxholes === true) {
            outputCard.body.push("(Bulletproof Cover)");
        }
        outputCard.body.push("Elevation: " + (elevation * 25) + " Feet");
        outputCard.body.push("[hr]");
        if (team.inCommand === true) {
            outputCard.body.push("Team is In Command");
        } else {
            outputCard.body.push("Team is NOT In Command");
        }
        if (team.bailed === true) {
            outputCard.body.push("[#ff0000]Team is Bailed Out[/#]");
        }
        if (team.order === "") {
            outputCard.body.push("No Order this Turn");
        } else {
            outputCard.body.push("Team Order: " + team.order);
        }
        if (team.specialorder !== "") {
            outputCard.body.push("Special Order: " + team.specialorder);
        }
        if (state.TY.passengers[team.id]) {
            outputCard.body.push("[hr]");
            outputCard.body.push("[U]Passengers[/u]");
            let passengers = state.TY.passengers[team.id];
            for (let i=0;i<passengers.length;i++) {
                let passengerTeam = TeamArray[passengers[i]];
                outputCard.body.push(passengerTeam.name);
            }
        }

        outputCard.body.push("[hr]");
        outputCard.body.push("Unit: " + unit.name);
        outputCard.body.push("# Teams: " + unit.teamIDs.length);
        if (unit.order === "") {
            outputCard.body.push("No Order this Turn");
        } else {
            outputCard.body.push("Unit Order: " + unit.order);
        }
        if (unit.pinned() === true) {
            outputCard.body.push("[#ff0000]Unit is Pinned[/#]");
        }

        PrintCard();
    }

    const LOS = (id1,id2,special) => {
        if (!special || special === "") {special = " "}; //  overhead - ignores concealment/BP for Short and intervening units, Spotter
        
        let team1 = TeamArray[id1];
        let team2 = TeamArray[id2];
        if (!team1) {
            log("No Team 1: " + id1)
        }
        if (!team2) {
            log("No Team 2: " + id2)
        }
    
        let distanceT1T2 = team1.hex.distance(team2.hex);
        let nightVisibility = distanceT1T2;
        let losReason = "";

        if (state.TY.darkness === true && special.includes("Spotter") === false && team2.token.get(SM.flare) === false) {
            if (team1.nightvisibility > 0) {
                nightVisibility = team1.nightvisibility;
            } else {
                nightVisibility = randomInteger(6) * 4;
                team1.nightvisibility = nightVisibility;
            }
            if (team1.special.includes("Infra-Red") || team1.special.includes("Thermal")) {
                nightVisibility = Math.max(nightVisibility,randomInteger(6)*4);
            }
        }
    
        let facing = Facing(id1,id2);
        let shooterFace = Facing(id2,id1);
        let team1Height = teamHeight(team1);
        let team2Height = teamHeight(team2);
        let teamLevel = Math.min(team1Height,team2Height);
        team1Height -= teamLevel;
        team2Height -= teamLevel;
    //log("Team1 H: " + team1Height)
    //log("Team2 H: " + team2Height)
    
        let interHexes = team1.hex.linedraw(team2.hex); //hexes from shooter (hex 0) to target (hex at end)
        let team1Hex = hexMap[team1.hexLabel];
        let team2Hex = hexMap[team2.hexLabel];
        let sameTerrain = findCommonElements(team1Hex.terrainIDs,team2Hex.terrainIDs);
        let lastElevation = team1Height;

        let hexesWithBuild = 0;
        let hexesWithTall = 0;
        let concealed = false;
        let bulletproof = false;
        let smoke = false;
        let los = true;
    
        if (nightVisibility < distanceT1T2) {
            let result = {
                los: false,
                concealed: false,
                bulletproof: false,
                smoke: false,
                facing: facing,
                shooterface: shooterFace,
                distance: distanceT1T2,
                special: special,
            }
            losReason = "Night Visibility < Distance"
            return result;    
        }
    
        let fKeys = Object.keys(TeamArray);

        if ((team2Hex.bp === true || team2Hex.foxholes === true) && team2.type === "Infantry") {
            //this catches foxholes, craters and similar
            concealed = true;
            bulletproof = true;
        }
    
        if (team2Hex.terrain.includes("Ridgeline") && team1Hex.terrain.includes("Ridgeline") === false && team1Height < team2Height) {
            //on a ridgeline with shooter below, ie hulldown
            concealed = true;
            bulletproof = true;
        }
    
        if (team1.type === "Aircraft" || team2.type === "Aircraft") {
            if (team1.type === "Aircraft") {
                let st = Math.max(interHexes.length - (2 + 1),0); //2 hexes before target plus target hex
                for (let i=st;i<interHexes.length;i++) {
                    let qrs = interHexes[i];
                    let interHex = hexMap[qrs.label()];
                    if (interHex.type === "Tall" || interHex.type === "Building") {
                        concealed = true;
                    }
                    if (interHex.smoke === true || interHex.smokescreen) {smoke = true};
                }
            } else {
                let en = Math.min(interHexes.length,(2 + 1)); //2 hexes from shooter plus shooters hex
                for (let i=0;i<en;i++) {
                    let qrs = interHexes[i];
                    let interHex = hexMap[qrs.label()];
                    if (interHex.type === "Tall" || interHex.type === "Building") {
                        concealed = true;
                    }                
                    if (interHex.smoke === true) {smoke = true};
                }
            }
        } else {
            if (sameTerrain === true && team1Hex.type === "Building") {
                // team 1 and 2 are in same building/room
                concealed = true;
                bulletproof = true;
            } else {
                //not in same building
                for (let i=0;i<interHexes.length;i++) {
                    let qrs = interHexes[i];
                    let qrsLabel = qrs.label();
                    let interHex = hexMap[qrsLabel];
    //log(i + ": " + qrsLabel)
    //log(interHex.terrain)
    //log("Type: " + interHex.type)
                    if (interHex.smoke === true || interHex.smokescreen === true) {smoke = true};
                    if (interHex.smokescreen === true && distanceT1T2 > 3) { ///6mm change
                        los = false;
                        break;
                    }

                    let interHexElevation = parseInt(interHex.elevation) - teamLevel;
                    let interHexHeight = parseInt(interHex.height);
                    let B;
                    if (team1Height > team2Height) {
                        B = (distanceT1T2 - i) * team1Height / distanceT1T2;
                    } else if (team1Height <= team2Height) {
                        B = i * team2Height / distanceT1T2;
                    }
        //log("InterHex Height: " + interHexHeight);
        //log("InterHex Elevation: " + interHexElevation);
        //log("Last Elevation: " + lastElevation);
        //log("B: " + B)
                    if (interHexElevation < lastElevation && lastElevation > team1Height && lastElevation > team2Height) {
                        los = false;
                        losReason = "Terrain Drops off at " + qrsLabel;
                        break;
                    }            

                    let friendlyFlag = false;
                    let friendlyHeight = 0;
        
                    if (special !== "Overhead" && special !== "Spotter" && special !== "Defensive" && i> 1) {
            //check for intervening friendlies in 1 hexes of interHex - can ignore if same unit
                        //if find one, flag and note height
            //log("Friendlies")
                        for (let t=0;t<fKeys.length;t++) {
                            let fm = TeamArray[fKeys[t]];
                            if (fm.id === team1.id || fm.id === team2.id || fm.player !== team1.player || fm.unitID === team1.unitID) {continue};
                            if (fm.type === "Infantry" && fm.moved === false) {continue}; //ignore these infantry
                            let dis = fm.hex.distance(qrs);
                            if (dis < 2) {
            //log(fm.name)
                                friendlyFlag = true;
                                fmHeight = teamHeight(fm);
                                friendlyHeight = Math.max(fmHeight,friendlyHeight);
                                if (special === "Flamethrower") {friendlyHeight = 100}; //basically cant fire Flamethrower over heads of friendlies
                            }
                        }
                    }

                    lastElevation = interHexElevation;

                    if (interHexHeight + interHexElevation + friendlyHeight >= B) {
                        if (friendlyFlag === true) {
                            losReason = "Friendly at " + qrsLabel + " blocks LOS"
                            los = false;
                            break;
                        }
        //log("Terrain higher than B")
                        //distances set to 1 for 6mm scale
                        if (i>1) {
                            if (interHex.type === 3) {
                                hexesWithBuild++;
                            }
                            if (hexesWithBuild > 1) {
                                los = false;
                                losReason = "> 1 hexes into Building at " + qrsLabel;
                                break;
                            }
                            if (hexesWithBuild > 1 && interHex.type < 3) {
                                los = false;
                                losReason = "Other side of Building at " + qrsLabel;
                                break;
                            }


                            if (interHex.type === 2) {
                                hexesWithTall++;
                            }
                            if (hexesWithTall > 1 && distanceT1T2 > 6) {
                                los = false;
                                losReason = "> 1 hexes through Tall terrain at " + qrsLabel; 
                                break;
                            }
                            if (interHex.type > 1) {
                                concealed = true;
                            }
                            if (interHex.type == 1 && special !== "Overhead") {
                                concealed = true;
                            }
                            if (interHex.bp === true && special !== "Overhead") {
                                bulletproof = true;
                            }
                        }
                    } else {
        //log("Terrain less than B")

                    }
                }
            }
            if (team2.type === "Infantry" && team2.moved === false) {
                concealed = true //infantry teams that didnt move are concealed to all but Aircraft
        //log("Infantry didnt move = Concealed")
            }
        }
    
        if (special.includes("Defensive")) {
            bulletproof = false
            facing = "Side/Rear"
        };

        if (team2.special.includes("Redemption")) {
            bulletproof = false;
        }
    
        let result = {
            los: los,
            losReason: losReason,
            concealed: concealed,
            bulletproof: bulletproof,
            smoke: smoke,
            facing: facing,
            shooterface: shooterFace,
            distance: distanceT1T2,
            special: special,
        }
        return result;
    }

    
    const TestLOS = (msg) => {
        let Tag = msg.content.split(";");
        let id1 = Tag[1];
        let id2 = Tag[2];
        if (!id1 || !id2) {return};
        let team1 = TeamArray[id1];
        let team2 = TeamArray[id2];
    
        SetupCard("LOS","",team1.nation);
        outputCard.body.push(team1.name + " looking at " + team2.name);
    
        let losResult = LOS(id1,id2,"");
    
        outputCard.body.push("[hr]");
        outputCard.body.push("Distance: " + losResult.distance);
        outputCard.body.push("LOS: " + losResult.los);

        if (losResult.los !== false) {
            outputCard.body.push("Concealed: " + losResult.concealed);
            if (team2.type === "Infantry") {
                outputCard.body.push("Bulletproof Cover: " + losResult.bulletproof);
            }
            outputCard.body.push("Smoke: " + losResult.smoke);
            if (team2.type === "Tank") {
                outputCard.body.push(team2.name + " Facing: " + losResult.facing);
            }
        } else {
            outputCard.body.push(losResult.losReason);
        }
    
        PrintCard();
    }

    const SetupGame = (msg) => {
        state.TY.turn = 0;
        let Tag = msg.content.split(";");
        let gametype = Tag[1];
        let startingPlayer = Number(Tag[2]);
        let timeOfDay = Tag[3];
        if (timeOfDay === "Random") {
            let roll = randomInteger(6);
            if (roll < 3) {timeOfDay = "Dawn"};
            if (roll === 3 || roll === 4) {timeOfDay = "Daylight"};
            if (roll > 4) {timeOfDay = "Dusk"};
        }
    
        state.TY.gametype = gametype;
        state.TY.currentPlayer = startingPlayer;
        state.TY.timeOfDay = timeOfDay;
        state.TY.darkness = false;
        if (timeOfDay === "Dawn" || timeOfDay === "Night") {
            state.TY.darkness = true;
        }
        state.TY.startingPlayer = startingPlayer;
        let side = ["Warsaw Pact","NATO"];
        let nat = state.TY.nations[startingPlayer][0];
        if (state.TY.nations[startingPlayer].length > 1) {
            nat = side[startingPlayer];
        }

        SetupCard("Setup New Game","","Neutral");
        outputCard.body.push("Game Type: " + gametype);
        outputCard.body.push("First Player: " + nat);
        outputCard.body.push("Time of Day: " + timeOfDay);

        PrintCard();
    }
    
    const GM = () => {
        SetupCard("GM Functions","","Neutral");
        ButtonInfo("Add Abilities","!AddAbilities");
        ButtonInfo("Clear State","!ClearState");
        ButtonInfo("Place in Reserve","!PlaceInReserve");

        //ButtonInfo("Kill Selected Team","!!KillTeam;@{selected|token_id}");
        ButtonInfo("Setup New Game","!SetupGame;?{Game Type|Meeting Engagement|Attack/Defend};?{First Player|Warsaw Pact,0|NATO,1};?{Time of Day|Daylight|Dawn|Dusk|Night|Random}");
        //ButtonInfo("Test LOS","!TestLOS;@{selected|token_id};@{target|token_id}");
        //ButtonInfo("Unit Creation","!UnitCreation;?{Unit Name};?{Formation Name};?{Support|No|Yes};");
        //ButtonInfo("Team Unit Info","!TeamInfo");
        PrintCard();
    }

    const LaserGuided = (id) => {
        let team = TeamArray[id];
        let artWeapon = team.artillery;
        let weapon;
        if (NATO.includes(team.nation)) {
            weapon = {
                name: "Copperhead Projectile",
                minRange: 16,
                maxRange: artWeapon.maxRange,
                halted: 1,
                moving: 1,
                at: 21,
                fp: 2,
                notes: "Brutal, Guided, HEAT",
                type: "Vehicle Missile",
            }
        } else {
            weapon = {
                name: "Krasnopol Projectile",
                minRange: 16,
                maxRange: artWeapon.maxRange,
                halted: 1,
                moving: 1,
                at: 4,
                fp: 1,
                notes: "Brutal, Guided, Krasnopol",
                type: "Vehicle Missile",
            }
        }
        return weapon
    }

    const ActivateUnit = (msg) => {
        RemoveLines();
        RemoveBarrageToken();
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let teamID = msg.selected[0]._id;
        let data = TokenCondition.LookUpMaster(teamID);
        if (data) {
            teamID = data.target;
        }
        let Tag = msg.content.split(";");
        let order = Tag[1];
        ActivateUnitTwo(teamID,order);
    }

    const ActivateUnitTwo = (teamID,order,specialorder) => {
        let team = TeamArray[teamID];
        let unit = UnitArray[team.unitID];
        let unitLeader = TeamArray[unit.teamIDs[0]];
        let targetTeam,targetName;
        let targetArray = [];

        if (team.inCommand === true && order !== "Spot") {
            targetTeam = unitLeader;
            targetName = unit.name;
            for (let i=0;i<unit.teamIDs.length;i++) {
                let tm = TeamArray[unit.teamIDs[i]];
                if (tm.inCommand === true) {
                    targetArray.push(tm);
                }
            }
        } else {
            targetTeam = team;
            targetName = team.name;
            targetArray = [targetTeam];
        }

        if (!specialorder) {
            specialorder = "";
            SetupCard(targetName,order,unit.nation);
            if (state.TY.step === "Shooting" && order === "Hold" && targetTeam.moved === true) {
                outputCard.body.push("Team/Unit has already moved and so cannot be issued a Hold Order");
                PrintCard();
                return;
            };
        };

        let noun = "Teams ";
        let verb = " are ";
        let noun2 = " their ";

        let extraLine = ""
        if (team.inCommand === false) {
            noun = "The Team ";
            verb = " is ";
            noun2 = " its ";
            outputCard.body.push("Out of Command Team");
            outputCard.body.push("[hr]");
            if (order === "Assault") {
                outputCard.body.push("Team defaults to a Tactical Order");
                order = "Tactical";
            };
            if (order === "Tactical") {
                extraLine = "Firing suffers an additional +1 Penalty";
            } else if (order === "Dash") {
                extraLine = "It should move towards the Unit Leader";
            } 
        }

        if (order.includes("Assault")) {
            if (unit.pinned() === true) {
                outputCard.body.push("Unit is Pinned, cannot Assault");
                outputCard.body.push("Unit defaults to a Tactical Order");
                order = "Tactical";
            }
        }

        if (order.includes("Tactical")) {
            if (unit.type === "Aircraft") {
                let needed = 4;
                if (unitLeader.special.includes("Observer")) {needed = 3};
                let roll = randomInteger(6);
                outputCard.body.push("Arrival Roll: " + DisplayDice(roll,team.nation,24));
                if (roll >= needed) {
                    outputCard.body.push("Aircraft Arrives and can be placed anywhere on the Field");
                    outputCard.body.push("Enemy AA Fire can happen anytime before the Aircraft attacks");
                } else {
                    outputCard.body.push("[#ff0000]The Unit is Refuelling/Refitting this turn[/#]");
                }
            } else {
                if (specialorder.includes("Dig In") === false) {
                    if (unit.pinned() === false) {
                        outputCard.body.push(noun + "can move at Tactical Speed, and may fire at" + noun2 + "Moving ROF");
                        outputCard.body.push(noun + 'cannot move within ' + 2*gameScale + ' hexes of enemies');
                    } else {
                        outputCard.body.push(noun + "can move at Tactical Speed, and may fire at" + noun2 + "Moving ROF");
                        outputCard.body.push(noun + "cannot move closer to enemy teams");
                    }
                }
            }
        } else if (order.includes("Dash")) {
            outputCard.body.push(noun + ' can move at Dash Speed, but may not fire');
            outputCard.body.push(noun + ' cannot move within ' + 8*gameScale + ' hexes of visible enemies');
            if (state.TY.darkness === true) {
                outputCard.body.push("Darkness limits speed to Terrain Dash");
            }
        } else if (order.includes("Hold")) {
            if (unit.pinned() === false) {
                outputCard.body.push(noun + " stay in place, and may fire at" + noun2 + "Halted ROF");
            } else {
                outputCard.body.push(noun + " stay in place, and may fire at" + noun2 + "Moving ROF");
            }
            outputCard.body.push(noun + verb + "Gone to Ground if not Firing");
        } else if (order === "Assault") {
            outputCard.body.push('Teams can move at Tactical Speed to a Max of ' + 10*gameScale + ' hexes, and may fire at their Moving ROF');
            outputCard.body.push('Teams must target an enemy within ' + 8*gameScale + ' hexes of the Team it will charge into');
            outputCard.body.push("Eligible Teams can complete the charge");
        } else if (order.includes("Spot")) {
            CreateBarrages(targetTeam.id);
        }
        targetTeam.token.set("aura1_color",Colours.black);

        outputCard.body.push(extraLine);
        for (let i=0;i<targetArray.length;i++) {
            targetArray[i].order = order;
            if (order === "Hold") {
                targetArray[i].addCondition("Hold");
            }
            if (targetArray[i].specialorder === "") {
                targetArray[i].specialorder = specialorder;
            } else if (targetArray[i].special.includes("Stormtroopers")) {
                targetArray[i].specialorder += "," + specialorder;
            } else {
                outputCard.body.push('[' + targetArray[i].name + " already has " + targetArray[i].specialorder + "]");
            }
        }
        if (team.inCommand === true && order !== "Spot") {
            unit.order = order;
            if (unit.specialorder !== "") {
                unit.specialorder += "," + specialorder;
            } else {
                unit.specialorder = specialorder;
            }
        }
        PrintCard();
    }

    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let data = TokenCondition.LookUpMaster(id);
        if (data) {
            id = data.target;
        }

        let token = findObjs({_type:"graphic", id: id})[0];
        let char = getObj("character", token.get("represents"));

        let abilArray = findObjs({  _type: "ability", _characterid: char.id});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        let team = TeamArray[id];
        if (!team) {return};

        let type = team.type;
        let cross = team.cross;
        let special = team.special;

        if (special.includes("Passengers")) {
            abilityName = "Dismount Passengers";
            action = "!DismountPassengers";
            AddAbility(abilityName,action,char.id);        
        }

        if (char.get("name").includes("Mine") && type === "System Unit") {
            abilityName = "Minefield Check";
            action = "!MinefieldCheck;@{selected|token_id};@{target|token_id}";
            AddAbility(abilityName,action,char.id);
        }

        if (type === "Infantry") {
            action = "!Activate;?{Order|Tactical|Dash|Hold|Assault|Spot}";
        } else if (type === "Gun") {
            if (team.tactical === 0) {
                action = "!Activate;?{Order|Dash|Hold|Spot}";
            } else {
                action = "!Activate;?{Order|Tactical|Dash|Hold|Spot}";
            }
        } else if (type === "Tank") {
            action = "!Activate;?{Order|Tactical|Dash|Hold|Assault|Spot}";
        } else if (type === "Unarmoured Tank") {
            action = "!Activate;?{Order|Tactical|Dash|Hold|Spot}";
        } else if (type === "Aircraft") {
            action = "!Activate;Tactical|Spot}";
        }

        abilityName = "Activate";
        AddAbility(abilityName,action,char.id);

        let specOrders;
        if (type === "Infantry") {
             specOrders = "!SpecialOrders;?{Special Order|Blitz & Move|Blitz & Hold|Dig In|Follow Me|Shoot and Scoot|Clear Minefield"
        } else if (type === "Gun") {
            specOrders = "!SpecialOrders;?{Special Order|Dig In|Cross Here"
        } else if (type === "Tank") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz & Move|Blitz & Hold|Cross Here|Follow Me|Shoot and Scoot";
            if (special.includes("Mine")) {
                specOrders += "|Clear Minefield";
            }
        } else if (type === "Unarmoured Tank") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz & Move|Blitz & Hold|Cross Here|Follow Me|Shoot and Scoot";
        } 

        specOrders += "}";

        if (type !== "Aircraft" && type !== "System Unit") {
            abilityName = "Special Orders";
            AddAbility(abilityName,specOrders,char.id);
        }

        if (type === "Infantry") {
            abilityName = "Mount";
            AddAbility(abilityName,"!Mount;@{selected|token_id};@{target|Transport|token_id}",char.id);
        }

        if (team.cross > 1) {
            abilityName = "Cross";
            AddAbility(abilityName,"!Cross",char.id);
        }

        let mg = false;
        let num = 1;
        for (let i=0;i<team.weaponArray.length;i++) {
            let weapon = team.weaponArray[i];
            if (weapon.type === "Artillery" || weapon.type === "Rockets") {
                if (team.type === "Aircraft") {
                    AddAbility("Target " + weapon.name,"!Activate;Spot",char.id);
                } else {
                    AddAbility("Preplan","!PlaceRangedIn",char.id);
                }
                continue; //no direct fire on this line
            }
            //if weapon has direct fire should classify type as gun
            let abName = weapon.name;
            let wtype = weapon.type;
            if (weapon.type.includes("MG")) {
                wtype = "MG"
                if (mg === true) {
                    continue;
                } else {
                    abName = "MGs"
                    mg = true;
                }
            }
            let shellType = "Regular";
            if (weapon.notes.includes("Smoke")) {
                shellType = "?{Fire Smoke|No,Regular|Yes,Smoke}";
            }
            if (weapon.notes.includes("Limited")) {
                let wn = weapon.notes.split(",");
                for (let i=0;i<wn.length;i++) {
                    if (wn[i].includes("Limited")) {
                        num = wn[i].replace(/[^0-9]+/g, "");
                        abName += " (Ltd " + num + ")";
                        break;
                    }
                }
            }
            abilityName = num + ": " + abName;
            action = "!Shooting;@{selected|token_id};@{target|token_id};" + wtype + ";" + shellType;
            AddAbility(abilityName,action,char.id);
            num++;
        }

        if (type === "Infantry" || type === "Tank") {
            AddAbility("Close Combat","!CloseCombat;@{selected|token_id}",char.id);
        }

    }

    const AddAbility = (abilityName,action,charID) => {
        createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
    }

    const Cross = (msg) => {
        if (!msg) {return}
        let id = msg.selected[0]._id;
        if (!id) {return};
        let team = TeamArray[id];
        SetupCard(team.name,"Cross",team.nation);
        let roll = randomInteger(6);
        let cross = team.cross;
        if (team.specialorder.includes("Cross Here")) {
            cross--;
        }
        if (state.TY.darkness === true) {
            cross++;
        }
        SetupCard(team.name,"vs. " + cross + "+",team.nation);
        outputCard.body.push("Roll: " + DisplayDice(roll,team.nation,24));
        if (roll >= cross) {
            outputCard.body.push("Success");
        } else {
            outputCard.body.push("Failure!<br>The Team stops where it is");
        }
//Leader Team Option to swap
        PrintCard();
    }

    const SpecialOrders = (msg) => {
        RemoveLines();
        //!Orders;?{Order|Blitz|Cross Here|Dig In|Follow Me|Shoot and Scoot} - and which varies by team type
        let Tag = msg.content.split(";");
        let teamID = msg.selected[0]._id;
        let specialorder = Tag[1];
        let team = TeamArray[teamID];
        let unit = UnitArray[team.unitID];
        let unitLeader = TeamArray[unit.teamIDs[0]];
        SetupCard(unit.name,specialorder,team.nation);
        let errorMsg = [];
        let step = state.TY.step;


        let roll = randomInteger(6);
        let stat = 1;

        if (specialorder === "Clear Minefield") {
            targetTeam = team;
        } else {
            targetTeam = unitLeader;
        }

        if (targetTeam.specialorder !== "") {
            if (targetTeam.special.includes("Stormtroopers") === false) {
                errorMsg.push("Teams can only have one Special Order per turn");
            } else if (targetTeam.specialorder.includes("Failed")) {
                errorMsg.push("Cannot have a 2nd Special Order after a failed one");
            } else if (targetTeam.specialorder.includes(",")) {
                errorMsg.push("Cannot have a 3rd Special Order");
            } else if (specialorder === "Clear Minefield" || specialorder === "Dig In") {
                errorMsg.push(specialorder + " takes a Teams entire turn");
            }
        }
        
        if (specialorder === "Blitz" || specialorder === "Dig In") {
            if (targetTeam.moved === true || (step === "Shooting" || step === "Assault")) {
                errorMsg.push(specialorder + " Order must be given before movement");
            }
        }
        if (specialorder === "Shoot and Scoot") {
            if (targetTeam.moved === true) {
                errorMsg.push("Unit has Moved and so cannot be given a Shoot and Scoot Order");
            }
            if (step !== "Assault") {
                errorMsg.push("Issue this order in the Assault Step");
            }
        }

        if (targetTeam.fired === true && specialorder !== "Shoot and Scoot") {
            errorMsg.push("Unit has Fired this turn, cannot be given that Order");
        }
        if (specialorder === "Clear Minefield") {
            if (targetTeam.moved === true) {
                errorMsg.push("Team has already Moved");
            }
        }

        if (errorMsg.length > 0) {
            for (let i=0;i<errorMsg.length;i++) {
                outputCard.body.push(errorMsg[i]);
            }
            PrintCard();
            return;
        }
        let line = DisplayDice(roll,unitLeader.nation,24) + " vs. ";
        if (specialorder === "Cross Here" || specialorder === "Clear Minefield") {
            line = "Auto";
        } else if (specialorder === "Follow Me") {
            stat = unitLeader.motivation;
            line += stat + "+  ";
        } else {
            stat = unitLeader.skill;
            line += stat + "+  ";
        }
        if (roll >= stat) {
            line += " Success!";
        } else {
            line += " Failure!";
        }
        
        outputCard.body.push(line);

        switch (specialorder) {
            case "Blitz & Move":
                if (roll >= stat) {
                    outputCard.body.push("The Unit Leader and any Teams that are In Command may immediately Move up to " + 4*gameScale + " hexes before making a normal Tactical Move");
                } else {    
                    outputCard.body.push("Teams from the Unit can only Move at Tactical speed and automatically suffer a +1 to hit penalty as if they had Moved Out of Command");
                    specialorder = "Failed Blitz";
                }
                ActivateUnitTwo(unitLeader.id,"Tactical",specialorder);
                break;
            case "Blitz & Hold":
                if (roll >= stat) {
                    outputCard.body.push("The Unit Leader and any Teams that are In Command may immediately Move up to " + 4*gameScale + " hexes and then take up a Hold Order");
                    ActivateUnitTwo(unitLeader.id,"Hold",specialorder);
                } else {    
                    outputCard.body.push("Teams from the Unit count as Moving at Tactical speed and automatically suffer a +1 to hit penalty as if they had Moved Out of Command");
                    specialorder = "Failed Blitz";
                    ActivateUnitTwo(unitLeader.id,"Tactical",specialorder);
                }
                break;
            case "Cross Here":
                outputCard.body.push("Any Teams (including the Unit Leader) from the Unit rolling to Cross Difficult Terrain within " + 6*gameScale + " hexes of where the Unit Leader crosses improve their chance of crossing safely, reducing the score they need to pass a Cross Test by 1.");
                ActivateUnitTwo(unitLeader.id,"Dash",specialorder);
                break;
            case "Dig In":
                if (roll >= stat) {
                    outputCard.body.push("In Command Infantry Teams Dig In");
                    DigIn(unit);
                } else {
                    outputCard.body.push("The Unit failed to Dig In");
                    specialorder = "Failed Dig In";
                }
                outputCard.body.push("The Teams can fire at their moving ROF (but cannot fire a Bombardment)");
                outputCard.body.push("If they do not Shoot or Assault, they are Gone to Ground");
                ActivateUnitTwo(unitLeader.id,"Tactical",specialorder)
                break;
            case "Follow Me":
                if (roll >= stat) {
                    outputCard.body.push("In Command Teams may immediately Move directly forward up to an additional " + 4*gameScale + " hexes, remaining In Command.")
                } else {
                    outputCard.body.push("Teams remain where they are")
                    specialorder = "Failed Follow Me";
                }
                outputCard.body.push("Teams may not fire");
                PrintCard();
                break;
            case "Shoot and Scoot":
                if (roll >= stat) {
                    outputCard.body.push("The Leader and any Teams that are In Command and did not Move in the Movement Step may immediately Move up to " + 4*gameScale + " hexes");
                } else {
                    outputCard.body.push("Teams remain where they are")
                }
                PrintCard();
                break;
            case "Clear Minefield":
                outputCard.body.push('The Team is ordered to clear a Minefield within ' + 2*gameScale + ' Hexes');
                outputCard.body.push("That Team counts as having Dashed, and cannot Shoot or Assault");
                outputCard.body.push("The Minefield can be removed immediately");
                outputCard.body.push("Other Teams may be given the same order");
                targetTeam.addCondition("Dash");
                targetTeam.moved = true;
                targetTeam.specialorder = specialorder;
                PrintCard();
                break;
        }
    }

    const DigIn = (unit) => {
        for (let i=0;i<unit.teamIDs.length;i++) {
            let team = TeamArray[unit.teamIDs[i]];
            if (team.type !== "Infantry" && team.type !== "Gun") {continue};
            if (team.inCommand === false || team.token.get("layer") === "walls") {continue};
            let hex = hexMap[team.hexLabel];
            if (team.artillery !== undefined) {
                RemoveRangedInMarker(unit.id);
            }
            if (hex.terrain.includes("Building") || hex.terrain.includes("Foxholes")) {continue};
            if (hex.terrain.includes("Offboard") || hex.terrain.includes("Reserves")) {continue};
            let dimensions = Math.max(team.token.get("height"), team.token.get("width")) + 25
            let newToken = createObj("graphic", {   
                left: team.location.x,
                top: team.location.y,
                width: dimensions, 
                height: dimensions,
                name: "Foxholes",  
                rotation: 30,
                isdrawing: true,
                pageid: team.token.get("pageid"),
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/253100240/1FOuKa7fU3YYi0Gf_Yz8DQ/thumb.png?1635623427",
                layer: "map",
                gmnotes: "GM"
            });
            toFront(newToken);
            hexMap[team.hexLabel].terrain.push("Foxholes");
            hexMap[team.hexLabel].foxholes = true;
            let fInfo = {
                hexLabel: team.hexLabel,
                id: newToken.id, //id of the Foxholes token, can be used to remove later
            }
            FoxholeArray.push(fInfo);
        }
    }
    
    const RemoveFoxholes = () => {
        let newFoxholes = [];
        for (let i=0;i<FoxholeArray.length;i++) {
            let foxhole = FoxholeArray[i];
            if (hexMap[foxhole.hexLabel].teamIDs.length === 0) {
                let index = hexMap[foxhole.hexLabel].terrain.indexOf("Foxholes");
                if (index > -1) {
                    hexMap[foxhole.hexLabel].terrain.splice(index,1);
                    hexMap[foxhole.hexLabel].foxholes = false;
                }
                let tok = findObjs({_type:"graphic", id: foxhole.id})[0];
                if (tok) {
                    tok.remove();
                }
            } else {
                newFoxholes.push(foxhole);
            }
        }
        FoxholeArray = newFoxholes;
    }
    
    const ChangeStep = (msg) => {
        let Tag = msg.content.split(";");
        let newStep = Tag[1];
        state.TY.step = newStep;
        if (newStep === "Start") {
            RemoveMoveMarkers();
            if (state.TY.darkness === true) {
                pageInfo.page.set({
                    dynamic_lighting_enabled: true,
                    daylight_mode_enabled: true,
                    daylightModeOpacity: 0.1,
                })
            } else {
                pageInfo.page.set("dynamic_lighting_enabled",false);
            }
            StartStep("ResLeaders");
        }
        if (newStep === "Movement") {
            SetupCard("Turn: " + state.TY.turn,"Movement Step",playerNation);
            outputCard.body.push("Give Units Orders if Desired");
            outputCard.body.push("Move Any or All Units");
            outputCard.body.push("Other Player can Interrupt for Opportunity Fire");
            outputCard.body.push("Teams that don't move,shoot or assault are considered Gone to Ground");
            PrintCard();
        }
        if (newStep === "Shooting") {
            SetHexes(state.TY.currentPlayer);
            RemoveMoveMarkers();
            SetupCard("Turn: " + state.TY.turn,"Shooting Step",playerNation);
            outputCard.body.push("Anti-Aircraft Fire");
            outputCard.body.push("Direct Fire");
            outputCard.body.push("Bombardments");
            PrintCard();
        }
        if (newStep === "Assault") {
            RemoveBarrageToken();
            AssaultHexes = [];
            SetupCard("Turn: " + state.TY.turn,"Assault Step",playerNation);
            outputCard.body.push("Units that have Assault Orders can Charge Into Contact");
            outputCard.body.push("Then conduct Assaults");
            PrintCard();
        }
    }


    const AdvanceStep = () => {
        RemoveLines();
        if (state.TY.nations[0].length === 0 && state.TY.nations[1].length === 0) {
            sendChat("","No Units Created Yet");
            return;
        }
        let turn = state.TY.turn;
        let currentStep = state.TY.step;
        let steps = ["Start","Movement","Shooting","Assault"];
        if (turn === 0) {
            for (let p=0;p<2;p++) {
                let num = 100 + parseInt(p);
                let form = new Formation(p,state.TY.nations[p][0],num,"Barrages");
                let unit = new Unit(p,state.TY.nations[p][0],num,"Barrages");
            }
            currentPlayer = state.TY.startingPlayer;
            if (state.TY.gametype === undefined || currentPlayer === undefined) {
                SetupCard("Setup Game","","Neutral");
                ButtonInfo("Setup New Game","!SetupGame;?{Game Type|Meeting Engagement|Attack/Defend};?{First Player|Warsaw Pact,0|NATO,1};?{Time of Day|Daylight|Dawn|Dusk|Night|Random}");
                PrintCard();
                return;
            }
            if (state.TY.gametype === "Meeting Engagement") {
                StartInFoxholes();
            }

            turn = 1;
            currentStep = "Start";
        } else {
            let num = steps.indexOf(currentStep);
            num += 1;
            if (num >= steps.length) {
                num = 0;
                if (state.TY.currentPlayer !== parseInt(state.TY.startingPlayer)) {
                    turn++;
                }
                state.TY.currentPlayer = (state.TY.currentPlayer === 0) ? 1:0;
            };
            currentStep = steps[num];
        }

        if ((state.TY.timeOfDay === "Dawn" || state.TY.timeOfDay === "Dusk") && currentPlayer === state.TY.firstPlayer && turn > 2) {
            let numDice = turn - 2;
            let flip = false;
            for (let i=0;i<numDice;i++) {
                let roll = randomInteger(6);
                if (roll > 4) {
                    flip = true;
                    break;
                }
            }
            if (flip) {
                SetupCard("Time Change","","Neutral");
                if (state.TY.timeOfDay === "Dawn") {
                    outputCard.body.push("[#ff0000]Morning has broken, the rest of the battle is fought in Daylight[/#]");
                    state.TY.timeOfDay = "Daylight";
                    state.TY.darkness = false;
                    pageInfo.page.set("dynamic_lighting_enabled",false);
                }
                if (state.TY.timeOfDay === "Dusk") {
                    outputCard.body.push("[#ff0000]Night has fallen, the rest of the battle is fought in Darkness[/#]");
                    state.TY.timeOfDay = "Night";
                    state.TY.darkness = true;
                    pageInfo.page.set({
                        dynamic_lighting_enabled: true,
                        daylight_mode_enabled: true,
                        daylightModeOpacity: 0.1,
                    })
                }
                PrintCard();
            }
        }

        state.TY.turn = turn;
        state.TY.step = currentStep;
        currentPlayer = state.TY.currentPlayer;

        let playerNation = state.TY.nations[state.TY.currentPlayer][0];
        if (state.TY.nations[state.TY.currentPlayer].length > 1) {
            playerNation = (WarsawPact.includes(state.TY.nations[state.TY.currentPlayer][0])) ? "Warsaw Pact":"NATO";
        }

        if (currentStep === "Start") {
            if (state.TY.darkness === true) {
                pageInfo.page.set({
                    dynamic_lighting_enabled: true,
                    daylight_mode_enabled: true,
                    daylightModeOpacity: 0.1,
                })
            } else {
                pageInfo.page.set("dynamic_lighting_enabled",false);
            }
            StartStep("ResLeaders");
        }
        if (currentStep === "Movement") {
            SetupCard("Turn: " + state.TY.turn,"Movement Step",playerNation);
            outputCard.body.push("Activate Units");
            outputCard.body.push("Special Orders if Desired");
            outputCard.body.push("Move any or all units");
            PrintCard();
        }
        if (currentStep === "Shooting") {
            inCommand(state.TY.currentPlayer);
            ResetAuras(state.TY.currentPlayer);
            SetupCard("Turn: " + state.TY.turn,"Shooting Step",playerNation);
            outputCard.body.push("Anti-Aircraft Fire");
            outputCard.body.push("Direct Fire");
            outputCard.body.push("Bombardments");
            PrintCard();
        }
        if (currentStep === "Assault") {
            RemoveBarrageToken();
            ResetAuras(state.TY.currentPlayer);
            assaultingUnitID = "";
            CCTeamIDs = [];
            SetupCard("Turn: " + state.TY.turn,"Assault Step",playerNation);
            outputCard.body.push("Units that have Assault Orders can Charge Into Contact");
            outputCard.body.push("Resolve Close Combats One Unit at a Time")
            outputCard.body.push("Defensive Fire")
            outputCard.body.push("Then conduct Assaults");
            PrintCard();
        }
    }

    const StartStep = (pass) => {
        let currentPlayer = parseInt(state.TY.currentPlayer);
        let nat = state.TY.nations[currentPlayer][0];  
        let side = ["Warsaw Pact","NATO"];
        if (state.TY.nations[currentPlayer].length > 1) {
            nat = side[currentPlayer];
        }  

        if (pass === "ResLeaders") {
            CheckArray = [];
            //check if a formation HQ for the player is dead
            let formationIDs = deadHQs[currentPlayer];
            for (let i=0;i<formationIDs.length;i++) {
                let formation = FormationArray[formationIDs[i]];
                if (formation) {
                    let eligibleUnitIDs = formation.unitIDs;
                    let team;
                    let possibleTeams = [];
                    for (let i=0;i<eligibleUnitIDs.length;i++) {
                        let unit = UnitArray[eligibleUnitIDs[i]];
                        let unitLeader = TeamArray[unit.teamIDs[0]];
                        if (unitLeader.special.includes("Transport")) {continue};
                        if ((unit.teamIDs.length > (lastStandCount[unit.type] + 1)) || unit.teamIDs.length === 1) {
                            team = unitLeader;
                            break;
                        } else {
                            possibleTeams.push(unitLeader);
                        }
                    }
                    if (team === undefined && possibleTeams.length > 0) {
                        team = possibleTeams[0];
                    }
                    if (team !== undefined) {
                        CheckArray.push(team);
                    }
                }
            }
            if (CheckArray.length > 0) {
                SetupCard("Field Promotions","",nat);
                ButtonInfo("Start","!FieldPromotions");
                PrintCard();            
            } else {
                StartStep("Remount");
            }
        }
        if (pass === "Remount") {
            deadHQs[currentPlayer] = [];
            CheckArray = [];
            let keys = Object.keys(UnitArray); 
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                if (unit.type !== "Tank" || unit.player !== state.TY.currentPlayer) {continue};
                let ids = unit.teamIDs;
                for (let j=0;j<ids.length;j++) {
                    let team = TeamArray[ids[j]];
                    if (team.bailed === true) {
                        CheckArray.push(team);
                    }
                }
            }
            if (CheckArray.length > 0) {
                SetupCard("Remount Checks","",nat);
                ButtonInfo("Start Remount Checks","!RemountChecks");
                PrintCard();            
            } else {
                StartStep("Rally");
            }
        }
        if (pass === "Rally") {
            CheckArray = [];
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                if (unit.player !== state.TY.currentPlayer || (unit.type !== "Infantry" && unit.type !== "Unarmoured Tank" && unit.type !== "Gun")) {continue};
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("No Unit Leader for this unit: " + unit.name);
                    log("# of units: " + unit.teamIDs.length);
                    return;
                }
                unit.size = unit.teamIDs.length;
                unitLeader.token.set("bar1_value",0);
                if (unit.pinned() === true) {
                    CheckArray.push(unit);
                };
            };
            if (CheckArray.length > 0) {
                SetupCard("Rally Checks","",nat);
                ButtonInfo("Start Rally Checks","!RallyChecks");
                PrintCard();            
            } else {
                StartStep("Unit Morale");
            }
        }
        if (pass === "Unit Morale") {
            CheckArray = [];
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("Error in Unit Morale Unit Leader")
                    log(unit)
                    continue;
                }
                if (unit.player !== state.TY.currentPlayer || unitLeader.special.includes("HQ") || unitLeader.token.get(SM.HQ) === true || unitLeader.special.includes("Independent")) {continue};
                let count = 0;
                let ids = unit.teamIDs;
                for (let j=0;j<ids.length;j++) {
                    let team = TeamArray[ids[j]];
                    if (team.type === "Tank") {
                        if (team.bailed === true) {
                            continue;
                        }
                    }
                    if (team.inCommand === true) {
                        count++;
                    }   
                }
                if (count < lastStandCount[unit.type]) {
                    CheckArray.push(unit);
                }
            }
            if (CheckArray.length > 0) {
                SetupCard("Unit Morale Checks","",nat);
                ButtonInfo("Start Morale Checks","!MoraleChecks");
                PrintCard();            
            } else {
                StartStep("Formation Morale");
            }
        }
        if (pass === "Formation Morale") {      
            let keys = Object.keys(FormationArray);
            for (let i=0;i<keys.length;i++) {
                let formation = FormationArray[keys[i]];
                if (formation.name === "Support" || formation.name === "Barrages") {continue};
                let unitNumbers = formation.unitIDs.length;
                if (unitNumbers < 2) {
                    SetupCard(formation.name,"Morale",formation.nation);
                    outputCard.body.push("The Formation as a whole breaks and flees the field!");
                    outputCard.body.push("Check Victory Conditions");
                    //destroy units/teams
                    PrintCard();
                }
            }
            StartStep("Final");
        }
        if (pass === "Final") {
            SetupCard("Turn: " + state.TY.turn,"Starting Step",nat);
            ClearSmoke();
            RemoveFoxholes();
            ResetFlags();
            if (state.TY.turn === 1 && state.TY.currentPlayer === state.TY.startingPlayer) {
                outputCard.body.push("Aircraft cannot Arrive this turn");
                outputCard.body.push("All Teams are treated as having moved in the Shooting Step");
                outputCard.body.push("No Artillery Bombardments this turn");
            } else {
                outputCard.body.push("In Order:")
                outputCard.body.push("1 - Reveal/Place Ambushes");
                outputCard.body.push("2 - Roll for Reserves");
                outputCard.body.push("3 - Roll for Strike Aircraft");
            }
            PrintCard();
        }
    }

    const ResetFlags = () => {
        let keys = Object.keys(UnitArray);
        for (let j=0;j<keys.length;j++) {
            let unit = UnitArray[keys[j]];
            let conditions = ["Dash","Tactical","Hold","Assault","Fired","AAFire","Radio"];
            if (unit.player === state.TY.currentPlayer) {
                for (let k=0;k<unit.teamIDs.length;k++) {
                    let team = TeamArray[unit.teamIDs[k]];
                    if (state.TY.conditions[team.id]) {
                        for (let c=0;c<conditions.length;c++) {
                            if (state.TY.conditions[team.id][conditions[c]]) {
                                team.removeCondition(conditions[c]);
                            }
                        }
                    }
                }
                if (state.TY.turn === 1) {
                    GTG(unit);
                }
            } else {
                GTG(unit);
            }
            for (let i=0;i<unit.teamIDs.length;i++) {
                let team = TeamArray[unit.teamIDs[i]];
                if (unit.player === state.TY.currentPlayer) {
                    team.spotAttempts = 0;
                    team.prevHexLabel = team.hexLabel;
                    team.prevHex = team.hex;
                    team.order = "";
                    team.specialorder = "";
                } else {
                    team.aaweapon = "";
                }

                team.hitArray = [];
                team.eta = [];
                team.nightvisibility = 0;
                team.moved = false;
                team.fired = false;
            }



            unit.order = ""; 
            unit.specialorder = "";
            unit.limited = 0;
            unit.size = unit.teamIDs.length;
            let unitLeader = TeamArray[unit.teamIDs[0]];
            if (unitLeader) {
                unitLeader.token.set("bar3_value",0);
                if (unitLeader.bailed === true) {
                    SwapLeader(unit);
                }
            }
        }
    }

    const GTG = (unit) => {
        let teamIDs = unit.teamIDs;
        for (let i=0;i<teamIDs.length;i++) {
            let team = TeamArray[teamIDs[i]];
            if (team.type === "System Unit" || team.type === "Aircraft") {continue};
            let gtg = (team.moved === true || team.fired === true) ? false:true;
            team.addCondition("GTG")
            team.gonetoground = true;
        }
    }

    const FieldPromotions = () => {
        let team = CheckArray.shift();
        if (team) {
            let location = team.location;
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            SetupCard(team.name,"Promote",team.nation);
            outputCard.body.push("Roll Against: 3+");
            ButtonInfo("Roll","!RollD6;Promote;" + team.id);
            PrintCard();
        } else {
            StartStep("Remount");
        }
    }

    const StartInFoxholes = () => {
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            let unit = UnitArray[keys[i]];
            DigIn(unit);
        }
    }


    const RemountChecks = () => {
        let team = CheckArray.shift();
        if (team) {
            let location = team.location;
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            SetupCard(team.name,"Remount",team.nation);
            outputCard.body.push("Roll Against: " + team.remount);
            ButtonInfo("Roll","!RollD6;Remount;" + team.id + ";" + team.remount);
            PrintCard();
        } else {
            StartStep("Rally");
        }
    }
    
    const RallyChecks = () => {
        let unit = CheckArray.shift();
        if (unit) {
            SetupCard(unit.name,"Rally",unit.nation);
            let unitLeader = TeamArray[unit.teamIDs[0]];
            let location = unitLeader.location;
            let rally = unitLeader.rally;    
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            outputCard.body.push("Roll Against: " + rally);
            ButtonInfo("Roll","!RollD6;Rally;" + unit.id + ";" + rally);
            PrintCard();
        } else {
            StartStep("Unit Morale");
         }
    }
    
    const MoraleChecks = () => {
        let unit = CheckArray.shift();
        if (unit) {
            SetupCard(unit.name,"Unit Morale",unit.nation);
            let unitLeader = TeamArray[unit.teamIDs[0]];
            let location = unitLeader.location;
            let lastStand = unitLeader.laststand;
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            outputCard.body.push("Roll Against: " + lastStand);
            ButtonInfo("Roll","!RollD6;UnitMorale;" + unit.id + ";" + lastStand);
            PrintCard();
        } else {
            StartStep("Formation Morale");
        }
    }
    
    const RollD6 = (msg) => {
        let Tag = msg.content.split(";");
        PlaySound("Dice");
        let roll = randomInteger(6);
        if (Tag.length === 1) {
            let playerID = msg.playerid;
            let nation = "Neutral";
            if (!state.TY.players[playerID] || state.TY.players[playerID] === undefined) {
                if (msg.selected) {
                    let id = msg.selected[0]._id;
                    if (id) {
                        let tok = findObjs({_type:"graphic", id: id})[0];
                        let char = getObj("character", tok.get("represents")); 
                        nation = Attribute(char,"nation");
                        state.TY.players[playerID] = nation;
                    }
                } else {
                    sendChat("","Click on one of your tokens then select Roll again");
                    return;
                }
            } else {
                nation = state.TY.players[playerID];
            }
            let res = "/direct " + DisplayDice(roll,nation,40);
            sendChat("player|" + playerID,res);
        } else {
            let type = Tag[1];
            if (type === "Remount") {
                let id = Tag[2];
                let needed = parseInt(Tag[3]);
                let neededText = needed.toString() + "+";
                let team = TeamArray[id];
                if (team.special.includes("Transport") && hexMap[team.hexLabel].terrain.includes("Offboard")) {
                    needed = 1;
                    neededText = "Auto"
                }
                let unit = UnitArray[team.unitID];
                let roll = randomInteger(6);
                let reroll = CommandReroll(team);
                SetupCard(team.name,"Needing: " + neededText,team.nation);
                outputCard.body.push("Team: " + DisplayDice(roll,team.nation,24));
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,team.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    team.remountTank();
                } else {
                    outputCard.body.push("Failure! Team remains Bailed Out");
                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Team";
                } 
                ButtonInfo(part1,"!RemountChecks");
                PrintCard();
            } else if (type === "Rally") {
                let unitID = Tag[2];
                let needed = parseInt(Tag[3]);
                let unit = UnitArray[unitID];
                let roll = randomInteger(6);
                let unitLeader = TeamArray[unit.teamIDs[0]];
                SetupCard(unit.name,"Needing: " + needed + "+",unit.nation);
                outputCard.body.push("Unit Leader: " + DisplayDice(roll,unit.nation,24));
                let reroll = CommandReroll(unitLeader);
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,unit.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    unit.unpin();
                } else {
                    outputCard.body.push("Failure! Unit remains Pinned");
                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Unit";
                } 
                ButtonInfo(part1,"!RallyChecks");
                PrintCard();
            } else if (type === "UnitMorale") {
                let unitID = Tag[2];
                let needed = parseInt(Tag[3]);
                let unit = UnitArray[unitID];
                let roll = randomInteger(6);
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("ERROR with Unit Leader of unit: " + unit.name)
                    return;
                }
                SetupCard(unit.name,"Needing: " + needed + "+",unit.nation);
                outputCard.body.push("Unit Leader: " + DisplayDice(roll,unit.nation,24));
                let reroll = CommandReroll(unitLeader);
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,unit.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    outputCard.body.push("Unit continues to fight.");
                } else {
                    outputCard.body.push("Failure! Unit Flees the Field!");
                    outputCard.body.push("(Any associated Transports Should be Removed)");
/*
                    FormationArray[unit.formationID].remove(unit);
                    for (let i=0;i<unit.teamIDs;i++) {
                        let id = unit.teamIDs[i];
                        TeamArray[id].Kill();
                    }
*/

                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Unit";
                } 
                ButtonInfo(part1,"!MoraleChecks");
                PrintCard();
            } else if (type === "Promote") {
                let id = Tag[2];
                let team = TeamArray[id]
                let roll = randomInteger(6);
                SetupCard(team.name,"Needing: 3+",team.nation);
                outputCard.body.push("Roll: " + DisplayDice(roll,team.nation,24));
                if (roll < 3) {
                    outputCard.body.push("Failure!");
                    outputCard.body.push("The Formation now lacks an HQ for the remainder of the Battle");
                } else {
                    outputCard.body.push("Success!");
                    outputCard.body.push(team.name + " assumes Command");
                    outputCard.body.push("He leaves his current Unit to form an HQ unit");
                    outputCard.body.push("Promoted Leaders cannot Spot");
                    let originalUnit = UnitArray[team.unitID];
                    originalUnit.remove(team);
                    let newUnit = new Unit(team.nation,stringGen(),"Promoted HQ",team.formationID);
                    newUnit.add(team);
                    let r = 0.1;
                    if (team.type === "Infantry") {r = 0.25};
                    let name = PromotedName(team);
                    team.token.set({
                        name: name,
                        tint_color: "transparent",
                        aura1_color: Colours.green,
                        aura1_radius: r,
                        showname: true,
                        statusmarkers: "",
                    })                    
                    team.name = name;
                    newUnit.hqUnit = true;
                    newUnit.size = 1;
                    team.token.set(SM.HQ,true);
                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Formation";
                }
                ButtonInfo(part1,"!FieldPromotions");
                PrintCard();
            }
        }
    }

    const CommandReroll = (team) => {
        //will be unitLeader if pinning, counterattack
        //else will be an individual tank team if remounting
        let reroll = -1;
        let formation = FormationArray[team.formationID];
        let formationLeaders = [];
        if (formation.name !== "Support") {
            for (let i=0;i<formation.unitIDs.length;i++) {
                let unit = UnitArray[formation.unitIDs[i]];
                if (unit.hqUnit === true) {
                    let leader = TeamArray[unit.teamIDs[0]];
                    formationLeaders.push(leader);
                }
            }
        } else {
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                if (unit.hqUnit === true && unit.player === team.player) {
                    let leader = TeamArray[unit.teamIDs[0]];
                    formationLeaders.push(leader);
                }
            }
        }
        for (let i=0;i<formationLeaders.length;i++) {
            let leader = formationLeaders[i];
            let checkID = leader.id;
            let losCheck = LOS(team.id,checkID);
            if (losCheck.los === true && losCheck.distance <= 6) {
                reroll = randomInteger(6);
                break;
            }
        }
        return reroll;
    }

    const Komissar = (unit) => {
        let komCheck = false;
        //returns true if unit has a Komissar who is in command
        let leader = TeamArray[unit.teamIDs[0]];
        for (let i=0;i<unit.teamIDs.length;i++) {
            let team = TeamArray[unit.teamIDs[i]];
            if (team.special.includes("Komissar") && team.inCommand === true) {
                komCheck = true;
            }
        }
        return komCheck;
    }

    const Shooting = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let weaponType = Tag[3]; 
        let shellType = Tag[4]; //Regular,Smoke
        let shooter = TeamArray[shooterID];
        let shooterUnit = UnitArray[shooter.unitID];
        let unitFire = false;
        let sname = shooter.name;

        if (state.TY.step === "Movement" || state.TY.step === "Start") {
            sendChat("","Advance Step before Shooting");
            return;
        }

        if (shooterID === shooterUnit.teamIDs[0]) {
            unitFire = true
            sname = shooterUnit.name;
            if (shooterUnit.order === "") {
                sendChat("","Unit Order defaulted to Hold");
                shooterUnit.order = "Hold"; //as if moved, would have been defaulted by changeGraphic already to Tactical
                for (let i=0;i<shooterUnit.teamIDs.length;i++) {
                    let sTeam = TeamArray[shooterUnit.teamIDs[i]];
                    if (i===0) {sTeam.token.set("aura1_color",Colours.black)};
                    if (sTeam.inCommand === true) {
                        sTeam.order = "Hold";
                        sTeam.addCondition("Hold");
                    }
                }
            }
        } else {
            if (shooter.order === "") {
                sendChat("","Team Order defaulted to Hold");
                shooter.order = "Hold";
            }
        }

        SetupCard(sname,"Shooting",shooter.nation);

        let defensive = false;
        if (shooter.player !== state.TY.currentPlayer) {
            defensive = true;
            outputCard.subtitle = "Defensive Fire";
            if (shooter.ccIDs.includes(targetID) === false || state.TY.step !== "Assault") {
                outputCard.body.push('This Team cannot conduct Defensive Fire');
                PrintCard();
                return;
            }
        }
        let shootingType = (defensive === true) ? "Defensive":"Normal";

        if (shooter.order === "Dash" && defensive === false) {
            outputCard.body.push('Team Dashed and cannot Fire');
            PrintCard();
            return;
        }

        let weapons = [];
        let shooterTeamArray = [];
        let target = TeamArray[targetID];
        let targetTeamArray = BuildTargetTeamArray(target,shooter);

        let mistaken = true;
        if (shooter.hex.distance(target.hex) < 8 && target.type === "Tank" && shooter.hex.distance(target.hex) < 4) {
            mistaken = false;
        }
        if (defensive === true) {mistaken = false};
log("Mistaken: " + mistaken)

        let limited = parseInt(shooterUnit.limited);
        let exclusions = [];

        for (let i=0;i<shooterUnit.teamIDs.length;i++) {
            let excluded;

            let st = TeamArray[shooterUnit.teamIDs[i]];
            if (CCTeamIDs.includes(st.id)) {
                outputCard.body.push("Teams that have Charged In cannot fire");
                outputCard.body.push("Use the Assault Button");
                PrintCard();
                return;
            }
            if (unitFire === false && shooterID !== st.id) {continue}; //single team firing
            if (st.inCommand === false && unitFire === true) {continue};
            if (defensive === false) {
                if (st.fired === true) {
                    excluded = " Fired Already";
                }
                if (st.aaFired === true) {
                    excluded = " Fired AA";
                }
                if (st.order === "Dash") {
                    excluded = " Dashed";
                }
                if (st.specialorder === "Clear Minefield") {
                    excluded = " is clearing Mines";
                }
                if (st.spotAttempts > 0) {
                    excluded = " Spotted for Artillery";
                }
            }

            if (st.aaweapon.hasOwnProperty("name")) {
                if (st.aaweapon.type === weaponType && defensive === true) {
                    excluded = " fired AA, can't use same weapon in Defensive Fire";
                }
            }

            if (st.type === "Tank" && st.bailed === true) {
                excluded = " is Bailed Out";
            }

            if (excluded === undefined) {
                let weaponExclusion;
                let flag = false;

                for (let j=0;j<st.weaponArray.length;j++) {
                    let weapon = st.weaponArray[j];
                    let overhead = "";
                    if (weaponType === "MG" && weapon.type.includes("MG") === false) {
                        continue;
                    } else if (weaponType !== "MG" && weapon.type !== weaponType) {
                        continue;
                    };
                    if (weapon.notes.includes("Limited")) {
                        let num;
                        let wn = weapon.notes.split(";");
                        for (let i=0;i<wn.length;i++) {
                            if (wn[i].includes("Limited")) {
                                num = wn[i].replace(/[^0-9]+/g, "");
                                break;
                            }
                        }
                        if (limited >= num) {
                            continue;
                        } else (limited++);
                    }

                    if (weapon.notes.includes("Overhead")) {overhead = "Overhead"}
                    if (target.type === "Aircraft" && (weapon.notes.includes("AA") === false || weapon.type.includes("AA") === false)) {
                        weaponExclusion = " has No AA Weapon";
                    } 

                    let initialLOS,tID;
                    for (let t=0;t<targetTeamArray.length;t++) {
                        tID = targetTeamArray[t].id;
                        initialLOS = LOS(st.id,tID,overhead);
                        if (initialLOS.los === true) {
                            break;
                        }
                    }

                    if (initialLOS.los === false) {
                        weaponExclusion = " has no LOS to Target(s)";
                    }

                    if (weapon.minRange > initialLOS.distance || weapon.maxRange < initialLOS.distance) {
                        weaponExclusion = " is Not In Range";
                    };
                    if (weapon.notes.includes("Forward Firing") && initialLOS.shooterface !== "Front") {
                        weaponExclusion = " is Out of Arc";
                    };

                    if (weaponExclusion === undefined) {
                        weapons.push(weapon);
                        let eta = {
                            targetName: TeamArray[tID].name,
                            targetID: tID,
                            los: initialLOS,
                            rangeFromInitial: 0,
                        }
                        st.eta = [eta];
                        shooterTeamArray.push(st);
                        flag = true;
                        if (weapon.type !== "AA MG") {
                            let phi = Angle(st.hex.angle(TeamArray[tID].hex));
                            st.token.set("rotation",phi);
                        }
                    } 
                }

                if (weaponExclusion !== undefined && flag === false) {
                    excluded = weaponExclusion;
                }
            }
            if (excluded !== undefined) {
                exclusions.push(st.name + excluded);
            }
        }

        shooterTeamArray = [...new Set(shooterTeamArray)];

        if (exclusions.length > 0) {
            for (let i=0;i<exclusions.length;i++) {
                outputCard.body.push(exclusions[i]);
            }
        }

        if (shooterTeamArray.length === 0) {
            PrintCard();
            return;
        }

        weapons = Unique(weapons,"name");
        let wnames = "";
        for (let i=0;i<weapons.length;i++) {
            if (i>0) {wnames += ", "}
            wnames += weapons[i].name;
        }


        outputCard.body.push(wnames);
        outputCard.body.push("[hr]");

        //expand ETA
        for (let i=0;i<shooterTeamArray.length;i++) {
            let st = shooterTeamArray[i];
            for (let j=0;j<targetTeamArray.length;j++) {
                let tt = TeamArray[targetTeamArray[j].id];
                if (defensive === true && st.ccIDs.includes(tt.id) === false) {
                    continue;
                }
                if (tt.id === st.eta[0].targetID) {continue} //already in ETA and checked
                let weaponFlag = false;
                let ttLOS;
                for (let k=0;k<weapons.length;k++) {
                    let weapon = weapons[k];
                    let special = "";
                    if (weapon.notes.includes("Overhead")) {special = "Overhead"};
                    if (defensive === true) {special = "Defensive"};
                    ttLOS = LOS(st.id,tt.id,special);
                    if (ttLOS.los === false) {continue};
                    if (ttLOS.distance > weapon.maxRange) {continue};
                    if (ttLOS.distance < weapon.minRange) {continue};
                    if (weapon.notes.includes("Forward Firing") && ttLOS.shooterface !== "Front") {continue};
                    weaponFlag = true;
                    break; //has one weapon with range and in arc
                }
                if (weaponFlag === false) {continue};
                let rfi = tt.hex.distance(target.hex);
                let eta = {
                    targetName: tt.name,
                    targetID: tt.id,
                    los: ttLOS,
                    rangeFromInitial: rfi,
                }
                st.eta.push(eta);
            }

            //reorder the eta based on distance from initial target
            st.eta = st.eta.sort(function(a,b) {
                return a.rangeFromInitial - b.rangeFromInitial;
            });
        }
log("# Shooters: " + shooterTeamArray.length)

log(weapons)
        let totalHits = 0;        

        for (let i=0;i<shooterTeamArray.length;i++) {
            let sTeam = shooterTeamArray[i];
            let moved = sTeam.moved;
            let eta = sTeam.eta;
            for (let j=0;j<weapons.length;j++) {
                let weapon = weapons[j];
                let toHit = target.hit;
                let toHitTips = "<br>Base: " + toHit;
                let los = eta[0].los;
                if (los.distance > 16) {
                    toHit++;
                    toHitTips += "<br>Long Range +1";
                }
                if (los.concealed === true) {
                    toHit++;
                    toHitTips += "<br>Concealed +1";
                    if (target.gonetoground === true) {
                        toHit++;
                        toHitTips += "<br>Gone to Ground +1";
                    } 
                }
                if (los.smoke === true) {
                    toHit++;
                    toHitTips += "<br>Smoke +1";
                }
                if (sTeam.inCommand === false) {
                    toHit++;
                    toHitTips += "<br>Not in Command +1";
                }
                if (state.TY.darkness === true) {
                    toHitTips += "<br>Darkness +1";
                    toHit++;
                }
                if (sTeam.specialorder === "Failed Blitz") {
                    toHit++;
                    toHitTips += "<br>Failed Blitz";
                }
                if (weapon.notes.includes("No HE") && (target.type === "Infantry" || target.type === "Gun")) {
                    toHit++;
                    toHitTips += "<br>No HE +1";
                }
                if (sTeam.special.includes("Overworked") && moved === true) {
                    toHit++;
                    toHitTips += "<br>Overworked & Moved +1";
                }
                if (weapon.notes.includes("Slow Firing") && moved === true) {
                    toHit++;
                    toHitTips += "<br>Slow Firing & Moved +1";
                }

                let rof = weapon.halted;
                if (sTeam.moved === true) {
                    rof = weapon.moving;
                }
                if (shooterUnit.pinned() === true) {
                    if (weapon.notes.includes("Pinned ROF")) {
                        let substring = weapon.notes.split(",");
                        substring = substring.filter((string) => string.includes("Pinned ROF"));
                        substring= substring.toString();
                        rof = parseInt(substring.replace(/[^0-9]+/g, ""));
                    } else {
                        rof = weapon.moving;
                    }
                }
                if (target.type === "Aircraft") {
                    if (weapon.notes.includes("Self Defence AA")) {
                        rof = 1;
                    } else if (weapon.notes.includes("Dedicated AA")) {
                        rof = weapon.halted;
                    }
                    sTeam.aaweapon = weapon;
                }

                let rolls = [];
                let hits = 0;
                for (let k=0;k<rof;k++) {
                    let roll = randomInteger(6);
                    let roll2 = randomInteger(6);
                    if (roll >= toHit) {
                        rolls.push(roll);
                        hits++;
                    } else if (toHit > 6 && toHit < 9 && roll === 6) {
                        rolls.push(roll + "/" + roll2);
                        if (toHit === 7 && roll2 > 4) {
                            hits++;
                        } else if (toHit === 8 && roll2 === 6) {
                            hits++;
                        }
                    } else {
                        rolls.push(roll);
                    }
                }

                rolls.sort();
                rolls.reverse();

                rolls = rolls.toString() + " vs. " + toHit + "+";

                totalHits += hits;
                let end;
                if (hits === 0) {
                    if (rof === 1) {
                        end = "1 Shot which Missed";
                    } else {
                        end = "Missed with " + rof + " Shots";
                    }
                } else if (rof > 1) {
                    let noun = " Hit";
                    if (hits > 1) {noun += "s"};
                    end = hits + noun + " from " + rof + " Shots";
                    if (shellType === "Smoke") {
                        end = "Smoked a Target";
                    }
                } else {
                    end = "1 Shot which Hit";
                    if (shellType === "Smoke") {
                        end = "Smoked a Target";
                    }
                }
    
                if (hits > 0) {
                    end = "[#ff0000]" + end + "[/#]";       
                }

                let line = '[🎲](#" class="showtip" title="Rolls: ' + rolls + toHitTips + ')' + sTeam.name + ": " + end;
                outputCard.body.push(line);
                PlaySound(weapon.type);
                //FX
                if (weapon.notes.includes("Limited")) {
                    shooterUnit.limited++;
                }

                //assign hits
                for (let q=0;q<hits;q++) {
    log("Hit " + (q+1))
                    let targNum = 0;
                    for (let t=0;t<(eta.length - 1);t++) {
                        let t1 = TeamArray[eta[t].targetID];
                        let num1 = t1.hitArray.length;
                        let t2 = TeamArray[eta[t+1].targetID];
                        let num2 = t2.hitArray.length;
    log("Target " + t + ": " + t1.name + " Hits: " + num1);
    log("Target " + (t+1) + ": " + t2.name + " Hits: " + num2);
                        if (num2 < num1) {
                            targNum = (t+1);
                            break;
                        }
                    }
    log("Assigned to " + TeamArray[eta[targNum].targetID].name);
                    if (shellType === "Smoke") {
                        weapon.name = "Smoke";
                    }
                    let hit = {
                        weapon: weapon,
                        bp: eta[targNum].los.bulletproof,
                        facing: eta[targNum].los.facing,
                        range: eta[targNum].los.distance,
                        shooterID: sTeam.id,
                        shooterType: sTeam.type,
                        rangedIn: false,
                        closeCombat: false,
                        special: eta[targNum].los.special,
                    }
                    TeamArray[eta[targNum].targetID].hitArray.push(hit);
                    if (weapon.type !== "AA MG") {
                        let phi = Angle(sTeam.hex.angle(TeamArray[eta[targNum].targetID].hex));
                        sTeam.token.set("rotation",phi);
                    }


                }
            }
            //place markers on shooter
            if (target.type === "Aircraft") {
                sTeam.addCondition("AAFire");
                sTeam.aaFired = true;
            } else if (defensive === false) {
                sTeam.addCondition("Fired");
                sTeam.fired = true;
            }
            if (state.TY.darkness === true) {
                sTeam.token.set(SM.flare,true);
            }

        } //end shooter(s)

        unitFiredThisTurn = true;

        for (let i=0;i<targetTeamArray.length;i++) {
            let tt = TeamArray[targetTeamArray[i].id];
            if (!unitIDs4Saves[tt.unitID]) {
                unitIDs4Saves[tt.unitID] = mistaken
            } 
        }

        //total hits
        outputCard.body.push("[hr]");
        outputCard.body.push("Total Hits: " + totalHits);

        let allFired = true;
        for (let i=0;i<shooterUnit.teamIDs.length;i++) {
            let team = TeamArray[shooterUnit.teamIDs[i]];
            if (team.fired === false && team.aaFired === false && team.bailed === false) {
                allFired = false;
                break;
            }
        }

        if (allFired === false) {
            outputCard.body.push("[hr]");
            outputCard.body.push("Not all Teams have fired");
            ButtonInfo("End Unit Fire","!EndFire;" + shootingType);
        }    
        PrintCard();
        if (allFired === true) {
            ProcessSaves(shootingType);
        } 
    }

    const CompareHits = (ta1,ta2) => {
        let hitInfo = {
            hits1: {
                swappable: [],
                unswappable: [],
            },
            hits2: {
                swappable: [],
                unswappable: [],
            }
        }
        for (let i=0;i<TeamArray[ta1.id].hitArray.length;i++) {
            let hit = TeamArray[ta1.id].hitArray[i];
            if (ta2.shooterIDs.includes(hit.shooterID)) {
                let newLOS = LOS(hit.shooterID,ta2.id,hit.special);
                hit.bp = newLOS.bp;
                hit.facing = newLOS.facing;
                hit.distance = newLOS.distance;
                hitInfo.hits1.swappable.push(hit);
            } else {
                hitInfo.hits1.unswappable.push(hit);
            }
        }
        for (let i=0;i<TeamArray[ta2.id].hitArray.length;i++) {
            let hit = TeamArray[ta2.id].hitArray[i];
            if (ta1.shooterIDs.includes(hit.shooterID)) {
                let newLOS = LOS(hit.shooterID,ta1.id,hit.special);
                hit.bp = newLOS.bp;
                hit.facing = newLOS.facing;
                hit.distance = newLOS.distance;
                hitInfo.hits2.swappable.push(hit);
            } else {
                hitInfo.hits2.unswappable.push(hit);
            }
        }
        return hitInfo;
    }

    const BuildTargetTeamArray = (targetTeam,shooterTeam) => {
        let array = [];
        let shooterUnit = UnitArray[shooterTeam.unitID];
        let targetUnit = UnitArray[targetTeam.unitID];
        let ids = targetUnit.teamIDs;

        //if HQ or independent, can add nearby formation in
        if (targetTeam.special.includes("HQ") || targetTeam.special.includes("Independent") || targetTeam.token.get(SM.HQ) === true) {
            let keys = Object.keys(UnitArray);
            btaLoop1:
            for (let j=0;j<keys.length;j++) {
                let unit = UnitArray[keys[j]];
                if (unit.id === targetUnit.id || unit.player !== targetUnit.player || unit.type !== targetUnit.type) {continue};
                for (let k=0;k<unit.teamIDs.length;k++) {
                    let team3 = TeamArray[unit.teamIDs[k]];
                    if (team3.hex.distance(targetTeam.hex) <= 6) {
                        //a valid team - add its unit IDs, rest will get sorted in/out below
                        ids = ids.concat(unit.teamIDs);
                        targetUnit.linkedUnitID = unit.id;
                        break btaLoop1;
                    }
                }
            }
        }

        for (let i=0;i<ids.length;i++) {
            let team = TeamArray[ids[i]];
            let refDistance = targetTeam.hex.distance(team.hex);//distance from targeted team to this team
            if (refDistance > 6 || team.type !== targetTeam.type) {continue}; //too far or not same type
            if (team.token.get("layer") === "walls") {continue}; //is a passenger
            if (shooterTeam.type === "Aircraft") {
                let keys = Object.keys(TeamArray);
                for (let k=0;k<keys.length;k++) {
                    let team3 = TeamArray[keys[k]];
                    if (team3.player === shooterTeam.player) {
                        if (team.hex.distance(team3.hex) < (8*gameScale)) {
                            continue; //Safety Distance
                        }
                    }
                }
            }

            for (let j=0;j<shooterUnit.teamIDs.length;j++) {
                let ttLOS = LOS(team.id,shooterUnit.teamIDs[j],"Overhead");
                if (ttLOS.los === true) {
                    team.shooterIDs.push(shooterUnit.teamIDs[j]);
                }
            }

            let info = {
                name: team.name,
                id: team.id,
                refDistance: refDistance,
            }
            array.push(info);
        }

        array = array.sort(function(a,b) {
            return a.refDistance - b.refDistance; //order based on distance from initial target
        });

    log("Target Array")
    log(array)
        return array;
    }




    const Mistaken = (unit) => {
log("In Mistaken")

        let array = [];
        for (let i=0;i<unit.teamIDs.length;i++) {
            let team = TeamArray[unit.teamIDs[i]];
            if (team.hitArray.length === 0) {continue};
            team.priority = 0;
            if (i===0) {team.priority = 1};
            if (team.special.includes("HQ") || team.special.includes("Independent") || team.token.get(SM.HQ) === true) {team.priority = 3};
            if (team.unique === true) {team.priority = 2};
            if (team.type === "Tank") {
                if (team.bailed === true) {
                    team.priority = -3;
                } else {
                    for (let j=0;j<team.hitArray.length;j++) {
                        let hit = team.hitArray[j];
                        if (hit.facing === "Side/Rear") {
                            team.priority += 1;
                        } else if (hit.range <= 16) {
                            team.priority += 1;
                        }
                    }
                }
            }
            array.push(team);
        }
        if (unit.hqUnit === true && unit.linkedUnitID !== "") {
            let linkedUnit = UnitArray[unit.linkedUnitID];
            for (let i=0;i<linkedUnit.teamIDs.length;i++) {
                let team = TeamArray[linkedUnit.teamIDs[i]];
                if (team.hitArray.length === 0) {continue};
                team.priority = 0;
                if (i===0) {team.priority = 1};
                if (team.special.includes("HQ") || team.token.get(SM.HQ) === true || team.special.includes("Independent")) {team.priority = 3};
                if (team.unique === true) {team.priority = 2};
                if (team.bailed === true && team.type === "Tank") {team.priority = -2};
                array.push(team);
            }
        }
log("Array Length: " + array.length)
        array = array.sort(function(a,b){
            return b.priority - a.priority;
        })
        let roll = randomInteger(6);
log("Roll: " + roll)

        for (let i=0;i<array.length;i++) {
            if (roll < 3) {break};
            let t1 = array[i];
log("T1: " + t1.name + " / Priority: " + t1.priority)
            for (let j=(array.length - 1);j>i;j--) {
                let t2 = array[j];
log("T2: " + t2.name + " / Priority: " + t2.priority)
                if (t1.priority === t2.priority) {continue};
                let hitInfo = CompareHits(t1,t2); //eligible hits for swapping
log("Hit Info")
log(hitInfo)
                if (hitInfo.hits2.swappable.length < hitInfo.hits1.swappable.length) {
log("A Swap Occurs")
                    outputCard.body.push("Hits on " + t1.name + " swapped to " + t2.name);
                    let h1 = hitInfo.hits1.unswappable.concat(hitInfo.hits2.swappable);
                    let h2 = hitInfo.hits2.unswappable.concat(hitInfo.hits1.swappable);
log("Team1 New Hits: " + h1.length);
log("Team2 New Hits: " + h2.length);
                    TeamArray[t1.id].hitArray = h1;
                    TeamArray[t2.id].hitArray = h2;
                    roll = randomInteger(6);
log("Roll: " + roll)
                    break;
                }
            }
        }
    }


    const CreateBarrages = (observerID) => {
log("In Create Barrages")        
        RemoveBarrageToken();
        RemoveLines();
        let observerTeam = TeamArray[observerID];
        let errorMsg = [];

        if (observerTeam.spotAttempts >= 3) {
            errorMsg.push("No further Spotting Attempts by this Team/Unit");
        }
        if (observerTeam.moved === true && observerTeam.type !== "Aircraft") {
            errorMsg.push("Spotter Team Moved or Dug In");
        }
        if (observerTeam.fired === true || observerTeam.aaFired === true) {
            errorMsg.push("Spotter Team has Fired");
        }
        if (observerTeam.player !== state.TY.currentPlayer) {
            errorMsg.push("Cannot Fire Barrage in Defensive Fire");
        }


        if (state.TY.turn === 1 && state.TY.gametype === "Meeting Engagement" && state.TY.startingPlayer === state.TY.currentPlayer) {
            errorMsg.push("No Barrages for First Player this Turn");
        }
        if (errorMsg.length > 0) {
            for (let i=0;i<errorMsg.length;i++) {
                outputCard.body.push(errorMsg[i]);
            }
            return;
        }
        let img = Nations[observerTeam.nation].barrageimage;
        img = getCleanImgSrc(img);
        let represents = Nations[observerTeam.nation].barrageChar;
        let colour = Nations[observerTeam.nation].borderColour;
        let location = hexMap[observerTeam.hexLabel].centre;
        //create macro for barrage based on current art availability
        let abilArray = findObjs({  _type: "ability", _characterid: represents});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        let abilityAction = "!BarrageLOS;@{selected|token_id}";
        AddAbility("Check",abilityAction,represents);

        let newToken = createObj("graphic", {   
            left: location.x,
            top: location.y,
            width: 70, 
            height: 70,  
            represents: represents,
            name: "Barrage Target",
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "objects",
            aura1_color: colour,
            aura1_radius: 2,
        });
        toFront(newToken);
        state.TY.barrageID = newToken.id;

        let num = 100 + parseInt(observerTeam.player);
        let barrageTeam = new Team(newToken.id,num,num);

        let ai = ArtilleryInfo(newToken.id,observerTeam,represents);//adds artillery options to barrage token
log("Artillery Info")
log(ai)
        let unitIDs = ai.unitIDs;
        let two = ai.two;
        if (two === true) {
            newToken.set({
                aura2_radius: 4,
                aura2_color: "#d9d9d9",
            });
        }
        if (two === "Salvo Only") {
            newToken.set("aura1_radius",4);
        }
        if (unitIDs.length === 0) {
            outputCard.body.push("No Available Artillery");
            RemoveBarrageToken(newToken.id);
            PrintCard();
            return;
        }
        let info = {
            observerID: observerID,
            artUnitIDs: unitIDs,
        }

        state.TY.BarrageInfo = info;

        outputCard.body.push("Place Barrage Marker");
        outputCard.body.push("Choose Artillery When in Place");
        //feeds back to ActivateUnit2
    }

    const ArtilleryInfo = (barrageID,spotter,barrageCharID) => {
        let unitIDs = [];
        let normal = false;
        let salvo = false;
        let artUnits = [];
        if (spotter.special.includes("HQ") || spotter.special.includes("Observer")) {
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                if (unit.artillery === false || unit.player !== spotter.player) {continue};
                if (unit.pinned() === true || unit.specialorder === "Failed Blitz" || unit.specialorder.includes("Dig In")) {continue};
                artUnits.push(unit);
            }
        } else {
            let unit = UnitArray[spotter.unitID];
            if (unit.pinned() === false) {
                artUnits.push(unit);
            };
        }
log ("Art Units")
log(artUnits)
        for (let i=0;i<artUnits.length;i++) {
            let unit = artUnits[i];
            for (let j=0;j<unit.teamIDs.length;j++) {
                let team = TeamArray[unit.teamIDs[j]];
                if (team.special.includes("Artillery") === false || team.fired === true || team.aaFired === true || team.bailed === true) {continue};
                if (team.type !== "Aircraft") {
                    if (hexMap[team.hexLabel].terrain.includes("Building") || team.moved === true) {
                        continue; //moved or in building
                    }
                }
                let weapon = team.artillery;
                if (weapon.moving === "Artillery" || weapon.halted === "Artillery") {
                    normal = true;
                }
                if (weapon.moving === "Salvo" || weapon.halted === "Salvo") {
                    salvo = true;
                }    
                smokeFlag = false;
                if (unitFiredThisTurn === false && weapon.notes.includes("Smoke Bombardment") === true && state.TY.smokeScreens[unit.player].includes(unit.id) === false) {
                    smokeFlag = true; //start of firing, hasnt fired its smoke bombardment
                }
                //add ability for this artillery unit to the barrage character
                let action = "!Artillery;" + barrageID + ";" + spotter.id + ";" + unit.id + ";Normal}"
                let abilityName = weapon.name;
                AddAbility(abilityName,action,barrageCharID);
                if (smokeFlag === true) {
                    abilityName += ": Smoke";
                    action = "!Artillery;" + barrageID + ";" + spotter.id + ";" + unit.id + ";Smoke Bombardment;?{Smoke Direction|Northeast|East|Southeast|Southwest|West|Northwest}";
                    AddAbility(abilityName,action,barrageCharID);
                };
                unitIDs.push(unit.id);
                break;
            }
        }

        let two = false;
        if (salvo === true && normal === true) {
            two = true;
        }
        if (salvo === true && normal === false) {
            two = "Salvo Only";
        }
        let res = {
            unitIDs: unitIDs,
            two: two,
        }
        return res;
    }

    const RemoveBarrageToken = (barrageID) => {
        if (!barrageID) {
            barrageID = state.TY.barrageID;
        }
        state.TY.barrageID = "";
        let barrageTeam = TeamArray[barrageID];
        if (!barrageTeam) {return};
        let barrageToken = barrageTeam.token;
        if (barrageToken) {
            barrageToken.remove();
        }
        delete TeamArray[barrageID]
    }


    const BarrageLOS = (msg) => {
        let Tag = msg.content.split(";");
        let barrageID = Tag[1];
        let barrageTeam = TeamArray[barrageID];

        let observerID = state.TY.BarrageInfo.observerID;
        let observerTeam = TeamArray[observerID];
        let artUnitIDs = state.TY.BarrageInfo.artUnitIDs;
        let artUnits = [];
        let air = false;

        for (let i=0;i<artUnitIDs.length;i++) {
            let unitID = artUnitIDs[i];
            let unit = UnitArray[unitID];
            if (unit.type === "Aircraft") {
                air = true;
            }
            artUnits.push(unit);
        }
        SetupCard("Barrage Check","",observerTeam.nation);
        //check LOS to Observer
        let observerLOS = LOS(observerID,barrageID,"Spotter");
        if (observerLOS.los === false) {
            outputCard.body.push("Observer does not have LOS to this point");
            outputCard.body.push("Only Ranged In Artillery can be called in");
            PrintCard();
            return;
        } 
        //check "Danger Close" - template within 2"  or 3" of edge if Salvo Template (6mm)
        let keys = Object.keys(TeamArray);
        let tooClose = [false,false];

        for (let i=0;i<keys.length;i++) {
            let team2 = TeamArray[keys[i]];
            if (team2.type === "Aircraft" || team2.type === "System Unit" || hexMap[team2.hexLabel].terrain.includes("Offboard") || hexMap[team2.hexLabel].terrain.includes("Reserves")) {continue};
            if (team2.player !== observerTeam.player) {continue};
            let distance2 = team2.hex.distance(barrageTeam.hex);
            if (air === true) {
                //4" from edge of template 6mm
                if (distance2 < (3+4)) {tooClose[0] = true};
                if (distance2 < (5+4)) {tooClose[1] = true};
            } else {
                //2" from edge of template or 3" for Salvo 6mm
                if (distance2 < (3+2)) {tooClose[0] = true};
                if (distance2 < (5+3)) {tooClose[1] = true};
            }
        }
        outputCard.body.push("[U]Units[/u]");

        for (let i=0;i<artUnits.length;i++) {
            if (i>0) {outputCard.body.push("[hr]")};
            let artUnit = artUnits[i];
            let artIDs = artUnit.teamIDs;
            let artTeam = TeamArray[artIDs[0]];            
            let name = artTeam.artillery.name;
            outputCard.body.push(name);

            let salvo = false;
            if (artTeam.artillery.moving === "Salvo" || artTeam.artillery.halted === "Salvo") {
                salvo = true;
            }

            let smoke = false;
            if (artTeam.artillery.notes.includes("Smoke Bombardment") && state.TY.smokeScreens[artUnit.player].includes(artUnit.id) === false && unitFiredThisTurn === false) {
                smoke = true;
            }
            if (tooClose[0] === true) {
                if (smoke === true) {
                    outputCard.body.push("[#FF0000]Too Close except for Smoke[/#]");
                } else {
                    outputCard.body.push("[#FF0000]Too Close to Friendlies[/#]");
                }
            } else if (tooClose[1] === true && salvo === true) {
                outputCard.body.push(name + ": [#FF0000]Too Close to Friendlies[/#]");
            }

            //check ranges and arc
            let oor = false;
            let oof = false;
            let num = 0;
            for (let j=0;j<artIDs.length;j++) {
                artTeam = TeamArray[artIDs[j]];
                let dist;
                if (hexMap[artTeam.hexLabel].terrain.includes("Offboard") ){
                    dist = 48;
                } else {
                    dist = artTeam.hex.distance(barrageTeam.hex);
                } 
                if (dist > artTeam.artillery.maxRange || dist < artTeam.artillery.minRange) {
                    oor = true;
                    continue;
                };
                if (artTeam.artillery.notes.includes("Forward Firing") && hexMap[artTeam.hexLabel].terrain.includes("Offboard") === false) {
                    let facing = Facing(artTeam.id,barrageTeam.id);
                    if (facing !== "Front") {
                        oof = true;
                        continue;
                    };
                }
                num++;
            }

            if (num === 0) {
                if (oor === true) {
                    outputCard.body.push("[#ff0000]Unit Out of Range[/#]");
                }    
                if (oof === true) {
                    outputCard.body.push("[#ff0000]Unit Out of Arc[/#]");
                }      
            } else {
                outputCard.body.push("Unit has Range");
                if (salvo === true) {
                    outputCard.body.push("Will use larger Salvo Template");
                }
            }   
        }
        PrintCard();
    }

    const Artillery = (msg) => {
        let Tag = msg.content.split(";");
        let barrageID = Tag[1];
        let observerID = Tag[2];
        let artUnitID = Tag[3];
        let ammoType = Tag[4]; //Normal, Smoke Bombardment
        let direction = Tag[5]; //in Smoke Bombardment
        let barrageTeam = TeamArray[barrageID];
        let observerTeam = TeamArray[observerID];
        let artilleryUnit = UnitArray[artUnitID];
    
        unitIDs4Saves = {};
        let rangedIn = false;
        let targetHex = barrageTeam.hex;

        SetupCard("Barrage","",observerTeam.nation);
        outputCard.body.push(artilleryUnit.name + " Firing");
    
        if (RangedInArray[artUnitID]) {
            if (RangedInArray[artUnitID].hexLabel === targetHex.label()) {
                rangedIn = true;
            } else {
                RemoveRangedInMarker(artUnitID);
            }
        }
    
        //check LOS to Observer
        let observerLOS = LOS(observerID,barrageID,"Spotter");
        if (observerLOS.los === false && rangedIn === false) {
            outputCard.body.push("[#ff0000]Observer does not have LOS[/#]");
            PrintCard();
            return;
        }

        let artilleryTeams = []; 
        let weapon;
        for (let i=0;i<artilleryUnit.teamIDs.length;i++) {
            let team = TeamArray[artilleryUnit.teamIDs[i]];
            if (team.artillery !== undefined) {
                let dist;
                if (hexMap[team.hexLabel].terrain.includes("Offboard") ){
                    dist = 48;
                } else {
                    dist = team.hex.distance(barrageTeam.hex);
                } 
                if (dist > team.artillery.maxRange || dist < team.artillery.minRange) {
                    continue;
                };
                if (team.artillery.notes.includes("Forward Firing") && hexMap[team.hexLabel].terrain.includes("Offboard") === false) {
                    let facing = Facing(team.id,barrageTeam.id);
                    if (facing !== "Front") {
                        continue;
                    };
                }
                artilleryTeams.push(team);
                weapon = team.artillery;
            }
        }
    
        if (artilleryTeams.length === 0) {
            outputCard.body.push("[#ff0000]No Teams have Range or Arc[/#]");
            PrintCard();
            return;
        }
    
        let templateRadius = 2;
        let tooCloseDist = 6; //4" to template radius
        if (weapon.moving === "Salvo" || weapon.halted === "Salvo") {
            templateRadius = 4;
            tooCloseDist = 10; //6" to template radius
        }
        if (artilleryTeams[0].type === "Aircraft") {
            tooCloseDist = templateRadius + 8;
        }
    
        if (ammoType !== "Smoke Bombardment") {
            //check "Danger Close"
            let keys = Object.keys(TeamArray);
            for (let i=0;i<keys.length;i++) {
                let team2 = TeamArray[keys[i]];
                if (team2.type === "Aircraft" || team2.type === "System Unit" || hexMap[team2.hexLabel].terrain.includes("Offboard") ||team2.player !== observerTeam.player ) {continue};
                let distance2 = team2.hex.distance(barrageTeam.hex);
                if (distance2 < tooCloseDist) {
                    outputCard.body.push("[#ff0000]Barrage is too close to Friendlies[/#]");
                    PrintCard();
                    return;
                };
            }
        }
    
        //in range,arc of at least one team; rotate to face, mark as fired - weapon will be the weapon info, gun num will be # of teams firing
        let gunNum = artilleryTeams.length;
        for (let i=0;i<artilleryUnit.teamIDs.length;i++) {
            let artTeam = artilleryTeams[i]; //catch any art units that werent in facing, as they still rotate to fire
            if (artTeam.artillery === undefined) {continue};
            let phi = Angle(artTeam.hex.angle(barrageTeam.hex));
            artTeam.token.set("rotation",phi);
            artTeam.fired = true;
            artTeam.addCondition("Fired");
            if (state.TY.darkness === true) {
                shooterTeam.token.set(SM.flare,true);
            }   
        }
        let addBattery = false;
        if (observerTeam.spotAttempts > 0) {
            addBattery = true;
        }
        let spotAttempts = 3 - observerTeam.spotAttempts; //as spotter may spot more than once, zeroed in Reset Flags routine
    
        let spotRolls = [];
        let needed = Math.max(observerTeam.skill,artilleryTeams[0].skill);
        let success = false;
        let crossTerrainCheck = false;
        let radiusHexes = [];
        let targetArray = [];
    
        if (ammoType !== "Smoke Bombardment") {
            //check if template over terrain and build array of any tokens in template
            radiusHexes = targetHex.radius(templateRadius);
            for (let i=0;i<radiusHexes.length;i++) {
                let hex = hexMap[radiusHexes[i].label()];
                if (hex.type > 0) {
                    crossTerrainCheck = true;
                }
                if (hex.teamIDs.length !== 0) {
                    for (let j=0;j<hex.teamIDs.length;j++) {
                        let team = TeamArray[hex.teamIDs[j]];
                        if (!team) {continue};
                        if (team.type === "Aircraft" || team.type === "System Unit") {continue};
                        if (team.token.get("layer") === "walls") {continue}; //passengers added if approp in process saves
                        targetArray.push(team);
                    }
                }
            }
            targetArray = [...new Set(targetArray)]; //eliminate duplicates
        }
    
        let tip2 = "";
        if (crossTerrainCheck) {
            needed += 1;
            tip2 += "<br>+1 Template over Terrain or Smoke"; 
        };
            if (state.TY.darkness === true) {
            needed += 1;
            tip2 += "<br>+1 Night Time";
        };

    
        if (rangedIn) {needed = 0};
        let neededText = needed.toString();
        if (needed < 6) {neededText += "+"}; 
        if (needed === 0) {
            neededText = "AUTO"
            tip2 = "<br>Automatic Due to Repeat Barrage";
        };
    
        for (let i=0;i<spotAttempts;i++) {
            let roll = randomInteger(6);
            spotRolls.push(roll);
            if (roll >= needed) {
                success = true;
                break;
            }
        }
    
        weaponName = weapon.name;
        let extra = "";
        if (ammoType === "Smoke Bombardment") {extra = "Smoke Screen with "};
    
        outputCard.body.push("Firing " + extra + weaponName)
        observerTeam.addCondition("Radio");
        let hittip = "Ranging In Rolls: " + spotRolls.toString() + " vs. " + neededText + tip2;
    
        observerTeam.spotAttempts += spotRolls.length;
        spotAttempts = observerTeam.spotAttempts
    
        let sound;
        if (weapon.type === "Small Arms") {
            sound = "Mortars";
        } else if (weapon.type === "Artillery") {
            sound = "Artillery";
        } else if (weapon.type === "Rockets") {
            if (artilleryTeams[0].type === "Aircraft") {
                sound = "ATG"
            } else {
                sound = "Katyusha";
            }
        }
        PlaySound(sound);

        let rerollException = false;
        if (weapon.notes.includes("Bombs")) {rerollException = true};        

        if (success === false) {
            let fail = '[🎲](#" class="showtip" title="' + hittip + ')' + "Failed to Range In";
            outputCard.body.push(fail);
            RemoveBarrageToken()
            PrintCard();
            return
        } else {
            let text = ["","1st","2nd","3rd"];
            let text2 = ["","","+1 to Roll Needed to Hit","+2 to Roll Needed to Hit"];
            if ((observerTeam.type !== "Aircraft") && rangedIn === false) {
                PlaceRangedInMarker(artilleryUnit,targetHex);
            }
            let success = '[🎲](#" class="showtip" title="' + hittip + ') Ranged in on the ' + text[spotAttempts] + ' Attempt';
            if (addBattery === true) {
                outputCard.body.push("(Ranging in Additional Battery)")
            }
            outputCard.body.push(success);
            if (ammoType !== "Smoke Bombardment") {
                outputCard.body.push(text2[spotAttempts]);
            }
            if (neededText === "AUTO") {
                outputCard.subtitle = "Repeat Bombardment";
            }
    
            if (ammoType === "Smoke Bombardment") {
                let num = gunNum * 4;
                SmokeScreen(targetHex,num,direction,artilleryUnit.player);
                state.TY.smokeScreens[artilleryUnit.player].push(artilleryUnit.id); //tracks that unit fired its one smoke bombardment
                outputCard.body.push("Smoke Screen successfully placed");
                RemoveBarrageToken()
                PrintCard();
                return;
            } else {
                if (observerLOS.los === false) {
                    outputCard.body.push("+1 to Roll Needed to Hit due to Spotter LOS");
                }
                if (gunNum < 3  && rerollException === false) {
                    outputCard.body.push("Hits Will be Rerolled Due to # of Guns");
                } else if (gunNum > 4) {
                    outputCard.body.push("Misses Will be Rerolled Due to # of Guns");
                }
                if (observerTeam.spotAttempts < 3 && observerTeam.unitID !== artilleryUnit.id) {
                    outputCard.body.push("The Spotting Unit can still Spot for other Artillery Units");
                    outputCard.body.push((3 - observerTeam.spotAttempts) + " Spot Attempts Left");
                }
                unitFiredThisTurn = true;
            }
        }
        //roll hits and saves
        outputCard.body.push("[hr]");
    
        if (targetArray.length === 0) {
            outputCard.body.push("No Targets Under Template");
        }
    
        for (let i=0;i<targetArray.length;i++) {
            let team = targetArray[i];
            let unitID = team.unitID;
            let unit = UnitArray[unitID];
            let neededToHit = parseInt(team.hit) + (spotAttempts - 1);
            if (observerLOS.los === false) {neededToHit += 1};//repeat bombardment, spotter doesnt have LOS
            let roll = randomInteger(6);
            if (gunNum < 3 && roll >= neededToHit && rerollException === false) {
                //reroll hits if only 1 or 2 guns
                roll = randomInteger(6);
            }
            if (gunNum > 4 && roll < neededToHit) {
                //reroll misses if 5+ guns
                roll = randomInteger(6);
            }
            let tip =  "To Hit: " + roll + " vs. " + neededToHit + "+";
    
            let hit = {
                weapon: weapon,
                bp: hexMap[team.hexLabel].bp,
                facing: "Top",
                range: 0,
                shooterType: artilleryTeams[0].type,
                rangedIn: rangedIn,
                closeCombat: false,
            }

            if (roll >= neededToHit) {
                team.hitArray = [hit];
                if (team.type === "Infantry" || team.type === "Unarmoured Tank") {
                    let unitLeaderToken = TeamArray[unit.teamIDs[0]].token;
                    unitLeaderToken.set("aura1_color",Colours.yellow);                 
                }
                if (!unitIDs4Saves[unitID]) {
                    unitIDs4Saves[unitID] = false; //no mistaken for artillery
                }
                outputCard.body.push('[🎲](#" class="showtip" title="' + tip + ')' + team.name + ": Hit");
            } else {
                outputCard.body.push('[🎲](#" class="showtip" title="' + tip + ')' + team.name + ": Missed");
            }
        }
        //RemoveBarrageToken()
    
        PrintCard();
        ProcessSaves("Artillery");
    }

    const RemoveLines = () => {
        let lineIDArray = state.TY.LOSLines;
        if (!lineIDArray) {
            state.TY.LOSLines = [];
            return;
        }
        for (let i=0;i<lineIDArray.length;i++) {
            let id = lineIDArray[i];
            let path = findObjs({_type: "path", id: id})[0];
            if (path) {
                path.remove();
            }
        }
        state.TY.LOSLines = [];  
    }

    const PlaceRangedInMarker = (artilleryUnit,targetHex) => {
        let nation = artilleryUnit.nation;
        let img = getCleanImgSrc(Nations[nation].rangedIn);
        let team = TeamArray[artilleryUnit.teamIDs[0]];
        let markers = team.token.get("statusmarkers").split(",");
log("Markers")       
log(markers)
        let marker = returnCommonElements(markers,Nations[nation].platoonmarkers);
log("Platoon Marker")
log(marker);
        marker = "status_" + marker;

        let location = hexMap[targetHex.label()].centre;
        let newToken = createObj("graphic", {   
            left: location.x,
            top: location.y,
            width: 70, 
            height: 70,
            name: "rangedin",  
            isdrawing: true,
            pageid: team.token.get("pageid"),
            imgsrc: img,
            layer: "map",
            gmnotes: artilleryUnit.id,
            statusmarkers: marker,
        });
        toFront(newToken);
        RangedInArray[artilleryUnit.id] = {
            hexLabel: targetHex.label(),
            tokenID: newToken.id,
        }
        return newToken; //used for preplanning
    }

    const RemoveRangedInMarker = (unitID) => {
        if (!RangedInArray[unitID]) {return};
        let tok = findObjs({_type:"graphic", id: RangedInArray[unitID].tokenID})[0];
        if (tok) {
            tok.remove();
        }
        delete RangedInArray[unitID];
    }

    const PlaceRangedIn = (msg) => {
        if (state.TY.turn > 0) {
            sendChat("","Only useable at Start of Game");
            return;
        }
        let artTeamID = msg.selected[0]._id;
        let artTeam = TeamArray[artTeamID];
        let artUnit = UnitArray[artTeam.unitID];
        if (RangedInArray[artUnit.id]) {
            RemoveRangedInMarker(artUnit.id);
        }
        let token = PlaceRangedInMarker(artUnit,artTeam.hex);
        token.set("layer","objects");
        SetupCard("Preplan Artillery",artUnit.name,artUnit.nation);
        outputCard.body.push("Place Token where desired");
        outputCard.body.push("Then Click Button to Finalize");
        ButtonInfo("Place","!FinalizeRangedIn;" + token.id);
        PrintCard();
    }

    const FinalizeRangedIn = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[1];
        let token = findObjs({_type:"graphic", id: id})[0];
        let location = new Point(token.get("left"),token.get("top"));
        let hex = pointToHex(location);
        let label = hex.label();
        location = hexMap[label].centre;
        token.set({
            left: location.x,
            top: location.y,
            layer: "map",
        });
    }

    const SmokeScreen = (targetHex,number,direction,player) => {
        let currentHex = targetHex;
        for (let i=0;i<number;i++) {
            let rotation = randomInteger(12) * 30;
            let location = hexMap[currentHex.label()].centre
            let img = getCleanImgSrc("https://s3.amazonaws.com/files.d20.io/images/254450996/PZo4LXP6LH6yN3tt674bDg/thumb.png?1636311012");
            let newToken = createObj("graphic", {   
                left: location.x,
                top: location.y,
                width: 100, 
                height: 100,  
                rotation: rotation,
                name: "SmokeScreen",
                isdrawing: true,
                pageid: Campaign().get("playerpageid"),
                imgsrc: img,
                layer: "map",
                gmnotes: player,
            });
            toFront(newToken);
            let sInfo = {
                hexLabel: currentHex.label(),
                id: newToken.id,
                player: player,
            }
            SmokeArray.push(sInfo); 
            hexMap[currentHex.label()].smokescreen = true;
            hexMap[currentHex.label()].smoke = true;
            currentHex = currentHex.neighbour(direction);
        }   
    }

    const ClearSmoke = () => {
        let newSmoke = []
        for (let i=0;i<SmokeArray.length;i++) {
            let info = SmokeArray[i];
            let hexLabel = info.hexLabel;
            let player = parseInt(info.player);
            if (player !== state.TY.currentPlayer) {
                newSmoke.push(info);
            } else {
                if (hexMap[hexLabel]) {
                    hexMap[hexLabel].smoke = false;
                    hexMap[hexLabel].smokescreen = false;
                }
                let token = findObjs({_type:"graphic", id: info.id})[0];
                if (!token) {
                    log(info)
                } else {
                    token.remove();
                }
            }
        }
        SmokeArray = newSmoke;
    }

    const DirectSmoke = (team) => {
        //place smoke on team
        let location = team.location;
        let rotation = randomInteger(12) * 30;
        let img = getCleanImgSrc("https://s3.amazonaws.com/files.d20.io/images/196609276/u8gp3vcjYAunqphuw6tgWw/thumb.png?1611938031");
        let newToken = createObj("graphic", {   
            left: location.x,
            top: location.y,
            width: 100, 
            height: 100,  
            rotation: rotation,
            name: "Smoke",
            isdrawing: true,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "map",
            gmnotes: currentPlayer,
        });
        toFront(newToken);
        //add to hexMap
        hexMap[team.hexLabel].smoke = true;
        //add to Smoke Array
        let sInfo = {
            hexLabel: team.hexLabel,
            id: newToken.id, //id of the Smoke token, can be used to remove later
            player: currentPlayer,
        }
        SmokeArray.push(sInfo);
    }


    const SwapLeader = (unit) => {
        if (unit.teamIDs.length < 2) {return}; 
        let team1 = TeamArray[unit.teamIDs[0]];
        for (let i=1;i<unit.teamIDs.length;i++) {
            let team2 = TeamArray[unit.teamIDs[i]];
            if (team2.hex.distance(team1.hex) <= 6) {
                if (team2.characterID === team1.characterID) {
                    let name1 = team1.name;
                    let name2 = team2.name;
                    team2.token.set("name",name1);
                    team2.name = name1;
                    team1.token.set("name",name2);
                    team1.name = name2;
                    let t2ID = team2.id;
                    let pos = unit.teamIDs.indexOf(t2ID);
                    unit.teamIDs.splice(pos,1);
                    unit.teamIDs.unshift(t2ID);
                    outputCard.body.push(name1 + " takes command of " + name2);
                    break;
                }
            }
        }
    }

    const EndFire = (msg) => {
        let Tag = msg.content.split(";");
        let type = Tag[1];
        ProcessSaves(type);
    }

    const ProcessSaves = (shootingType) => {
log("In Process Saves")
log(unitIDs4Saves)
        let keys = Object.keys(unitIDs4Saves);
        if (keys.length === 0) {return};
        for (let i=0;i<keys.length;i++) {
            let unit = UnitArray[keys[i]];
            let pinMargin = 5;
            if (unit.size > 11) {pinMargin = 8};
            let casualties = 0;
            let bailedOut = 0;
            SetupCard(unit.name,"Saves",unit.nation);
            if (unitIDs4Saves[keys[i]] === true) {
                //run Mistaken
                Mistaken(unit);
            }
            let flamethrowerFlag = false;
            let unitLeader = TeamArray[unit.teamIDs[0]];
            let unitHits = parseInt(unitLeader.token.get("bar3_value"));
            unit.teamIDs.forEach((id) => {
                let team = TeamArray[id];
                if (team.hitArray.length === 0) {return};
            
            //seperate out smoke from regular hits, weapon.name will be "Smoke"
            //use DirectSmoke(team)

            //if has passengers - if riders then they all take hits, if in transport then only if killed

                unitHits += team.hitArray.length;
                let results = ProcessSavesTwo(team);
                for (let m=0;m<results.length;m++) {
                    outputCard.body.push(results[m]);
                }
                //turn  flamethrowerflag true if hit by flamethrower
                team.hitArray = [];
                team.shooterIDs = [];
            });


            if (unitHits === 0) {
                outputCard.body.push("(Swapped)");
                continue;
            }
    

            if (unit) {
                if (unit.type === "Infantry" || unit.type === "Gun" || unit.type.includes("Unarmoured")) {
                    unitLeader = TeamArray[unit.teamIDs[0]]; //in case original killed
                    unitLeader.token.set("bar3_value",unitHits);
                    if (unitHits >= pinMargin && unit.pinned() === false) {
                        outputCard.body.push("The Unit is Pinned");
                        unit.pin();
                        if (shootingType === "Defensive") {
                            outputCard.body.push("The Unit must Fall Back");
                        }
                    }
                    if (flamethrowerFlag === true && unit.pinned() === false) {
                        outputCard.body.push("The Unit is Pinned");
                        unit.pin();
                    }
                } else if (unit.type === "Tank" && shootingType === "Defensive") {
                    unitLeader = TeamArray[unit.teamIDs[0]]; //in case original killed
                    if ((bailedOut + casualties) >= 2) {
                        outputCard.body.push("The Unit must Fall Back");
                    }
                    if (unit.teamIDs.length === 1 && unitLeader.bailed === true) {
                        outputCard.body.push("The Unit must Fall Back");
                    }
                }
            }




            unit.linkedUnitID = "";
            PrintCard();
        }
        unitIDs4Saves = {};
    }




    const ProcessSavesTwo = (team) => {
        let hits = team.hitArray;
        let tip = "";
        let saveResult = [];
        let outputArray = {
            "deflect": 0,
            "minor": 0,
            "destroyed": 0,
            "bailed": 0,
            "bailedAgain": 0,
            "flees": 0,
            "saved": 0,
            "cover": 0,
        }
        //let heliFlag = (team.type === "Helicopter" && team.token.get(sm.landed) === false) ? true:false;
        let save; //as single hit's save can then carry onto output part
    
        for (let k=0;k<hits.length;k++) {
            let hit = hits[k];
            save = team.Save(hit,k+1);
            if (k>0) {
                tip += "<br>";
            }
            tip += save.tip
            outputArray[save.result] += 1;
        }
    
        if (hits.length === 1) {
            saveResult.push('[🎲](#" class="showtip" title="' + tip + ') ' + team.name + ": 1 Hit");
            saveResult.push(SaveResults[save.result]);
        } else {
            saveResult.push('[🎲](#" class="showtip" title="' + tip + ') ' + team.name + ": " + hits.length + " Hits");
            if (team.type === "Tank") {
                if (outputArray.destroyed > 0) {
                    saveResult.push(SaveResultsMult.destroyed);
                } else if (outputArray.flees > 0) {
                    saveResult.push(SaveResultsMult.flees);
                } else if (outputArray.bailedAgain > 0) {
                    saveResult.push(SaveResultsMult.bailedAgain);
                } else if (outputArray.bailed > 0) {
                    saveResult.push(SaveResultsMult.bailed);
                } else if (outputArray.minor > 0) {
                    saveResult.push(SaveResultsMult.minor);
                } else {
                    saveResult.push("All Hits Deflected by Armour");
                }
            } else if (team.type === "Infantry" || team.type === "Unarmoured Tank" || team.type === "Gun") {
                if (outputArray.destroyed > 0) {
                    saveResult.push(SaveResultsMult.destroyed);
                } else if (outputArray.cover > 0) {
                    saveResult.push(SaveResultsMult.cover);
                } else {
                    saveResult.push(SaveResultsMult.saved);
                }
            } else if (team.type === "Aircraft" || team.type === "Helicopter") {
                if (outputArray.destroyed > 0) {
                    saveResult.push(SaveResultsMult.destroyed);
                } else if (outputArray.minor > 0) {
                    saveResult.push(SaveResultsMult.minor);
                } else {
                    saveResult.push(SaveResultsMult.saved);
                }
            }
        }
    
        if (outputArray.destroyed > 0) {
            team.kill();
        }
    
        team.hitArray = [];
        team.priority = 0;
    

    
        return saveResult;
    }
    










    const inCommand = (team) => {
        //'team' could be an actual team or could be "All" or the player #
        if (team === "All" || team === 0 || team === 1) {
            let unitKeys = Object.keys(UnitArray);
            for (let i=0;i<unitKeys.length;i++) {
                let unit = UnitArray[unitKeys[i]];
                if (team !== "All" && team !== unit.player) {continue};
                unit.updateTeamIDs();
                unit.IC();
            }
        } else {
            let unit = UnitArray[team.unitID];
            unit.IC();
        }
    }

    const InCC = (team1) => {
        if (team1.order !== "Assault" || team1.token.get("layer") === "walls") {return};
        //determine if this team is now in B2B or if infantry in 2nd row
        let teamKeys = Object.keys(TeamArray);
        if (assaultingUnitID !== "") {
            let currentUnit = UnitArray[team1.unitID];
            let prevUnit = UnitArray[assaultingUnitID];
            if (currentUnit.id !== assaultingUnitID) {
                //check if is mix of HQ and own unit
                if ((currentUnit.hqUnit === false && prevUnit.hqUnit === false) || prevUnit.formationID !== currentUnit.formationID) {
                    //new unit charging in, reset markers and IDs
                    CCTeamIDs = [];
                    assaultingUnitID = team1.unitID;
                    for (let i=0;i<teamKeys.length;i++) {
                        let checkTeam = TeamArray[teamKeys[i]];
                        checkTeam.token.set(SM.defensive,false);
                        checkTeam.token.set(SM.surprised,false);
                    }
                }
            }
        } else {
            assaultingUnitID !== team1.unitID;
        }

        let inCC = false;
        for (let i=0;i<teamKeys.length;i++) {
            let team2 = TeamArray[teamKeys[i]];
            if (team2.id === team1.id) {continue};
            let dist = team1.hex.distance(team2.hex);
            if (dist > 1) {continue};
            if (team2.player !== team1.player && team2.type !== "System Unit") {
                inCC = true;
                break;
            } else {
                if (team1.type === "Infantry" && team2.type === "Infantry" && CCTeamIDs.includes(team2.id)) {
                    inCC = true;
                    break;
                }
            }
        }
        let ccError = false;
        if (inCC === false) {
            let index = CCTeamIDs.indexOf(team1.id);
            log(index)
            if (index > -1) {
                CCTeamIDs.splice(index,1);
                Defensive(team1,"Remove");
            }
        } else {
            let errorMsg;
            if (state.TY.step !== "Assault") {
                errorMsg = "Not Assault Step";
            }
            if (team1.special.includes("Heavy Weapon")) {
                errorMsg = "This Team is a Heavy Weapons Team and cannot Charge into Contact";
            }
            if (team1.aaweapon.hasOwnProperty("name")) {
                errorMsg = "This Team fired AA Fire and cannot Charge into Contact";
            }

            if (errorMsg !== undefined) {
                ccError = true;
                sendChat("",errorMsg);
            } else if (CCTeamIDs.includes(team1.id) === false) {
                CCTeamIDs.push(team1.id);
                Defensive(team1,"Add");
            }
        }
        return ccError;
    }

    const Defensive = (team1,action) => {
        //mark/update tokens able to defensive fire
        let teamKeys = Object.keys(TeamArray);
        for (let i=0;i<teamKeys.length;i++) {
            let team2 = TeamArray[teamKeys[i]];
            if (team2.id === team1.id || team2.player === team1.player || team2.token.get("layer") === "walls") {continue};
            let dist = team1.hex.distance(team2.hex);
            let chargeDist = team1.hex.distance(team1.prevHex);
log("Charge Dist: " + chargeDist)
            if (action === "Add" && dist <= (8*gameScale) && team2.token.get(SM.surprised) === false) {
                if (dist === 1 && team1.fired === false && hexMap[team1.prevHexLabel].type > 0 && chargeDist <= (4*gameScale)) {
                    team2.token.set(SM.defensive,false);
                    team2.token.set(SM.surprised,true);
                    continue;
                };
                team2.ccIDs.push(team1.id);
                team2.token.set(SM.defensive,true);   
            }
            if (action === "Remove") {
                let index = team2.ccIDs.indexOf(team1.id);
                if (index > -1) {
                    team2.ccIDs.splice(index,1);
                }
                if (team2.ccIDs.length === 0) {
                    team2.token.set(SM.defensive,false);
                }
            }
        }
    }

    const CloseCombat = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id
        if (!id) {return};
        let team = TeamArray[id];
        SetupCard("Start Close Combat","",team.nation);
        ButtonInfo("Click Button to Start","!CloseCombatTwo;" + id);
        PrintCard();
    }

    const CloseCombatTwo = (msg) => {
        let Tag = msg.content.split(";");
        let id = Tag[1];
        let team = TeamArray[id];
        let attackingNation = team.nation;
        let defendingNation;
        if (!team) {return};
        let attackingPlayer = team.player;
        SetupCard("Assault","",attackingNation);
        let errorMsg;
        let array1 = [];
        for (let i=0;i<CCTeamIDs.length;i++) {
            let team = TeamArray[CCTeamIDs[i]];
            if (team) {
                let token = team.token;
                if (token) {array1.push(team.id)};
            }
        }
        let array2 = [],attackingTeamIDs = [],defendingTeamIDs = [],defendingUnitIDs = [];
        let teamKeys = Object.keys(TeamArray);
        for (let i=0;i<teamKeys.length;i++) {
            let team = TeamArray[teamKeys[i]];
            if (team.token.get(SM.defensive) === true || team.token.get(SM.surprised) === true) {
                array2.push(team.id); //filter out the further away ones later
            }
        }
        if (attackingPlayer === state.TY.currentPlayer) {
            attackingTeamIDs = array1;
            defendingTeamIDs = array2;
        } else {
            attackingTeamIDs = array2;
            defendingTeamIDs = array1;
        }
        if (attackingTeamIDs.length === 0) {
            errorMsg = "No Attackers in Base to Base Contact";
        }
        if (defendingTeamIDs.length === 0) {
            errorMsg = "No Defenders left";
        }

        for (let i=0;i<defendingTeamIDs.length;i++) {
            let dt = TeamArray[defendingTeamIDs[i]];
            defendingNation = dt.nation;
            if (defendingUnitIDs.includes(dt.unitID) === false) {
                defendingUnitIDs.push(dt.unitID);
            }
        }

        if (errorMsg !== undefined) {
            outputCard.body.push(errorMsg);
            PrintCard();
            return;
        }

log(attackingTeamIDs)
log(defendingTeamIDs)


        //define possible targets for attacking teams
        for (let i=0;i<attackingTeamIDs.length;i++) {
            let team1 = TeamArray[attackingTeamIDs[i]];
log("Attacker: " + team1.name)
            team1.assaultTargetIDs = [];
            team1.frontLine = false;
            let team2;
            for (let j=0;j<defendingTeamIDs.length;j++) {
                team2 = TeamArray[defendingTeamIDs[j]];
                if (team1.type === "Tank" && team2.type === "Tank") {continue}
                if (team1.hex.distance(team2.hex) === 1) {
                    team1.assaultTargetIDs.push(team2.id);
                    team1.frontLine = true;
log("Target: " + team2.name)
                }
            }
            if (team1.assaultTargetIDs.length === 0 && team1.type === "Infantry") {
                //check if 2nd row infantry
                for (let j=0;j<attackingTeamIDs.length;j++) {
                    let team3 = TeamArray[attackingTeamIDs[j]];
                    if (team3.frontLine === false) {continue};
                    if (team3.type !== "Infantry" || team3.id === team1.id) {continue};
                    if (team1.hex.distance(team3.hex) === 1) {
log("2nd Row to " + team3.name)
                        if (team3.assaultTargetIDs.length !== 0) {
                            team1.assaultTargetIDs = team1.assaultTargetIDs.concat(team3.assaultTargetIDs);
                        }
                    }
                }
            }
        }
        //for each attacker, roll to hit etc
        let limited = 0;
        for (let i=0;i<attackingTeamIDs.length;i++) {
            let attTeam = TeamArray[attackingTeamIDs[i]];
            let line,end;
            let bracket1 = "";
            let bracket2 = "";
            let weapon = DeepCopy(attTeam.weaponArray[0]);
            if (attTeam.assaultTargetIDs.length === 0) {
                line = attTeam.name + " has no Targets";
                end = "";
            } else {
                let needed = attTeam.assault;
                if (attTeam.special.includes("Mounted Assault")) {
                    if (state.TY.passengers[attTeam.id]) {
                        let passengerNumber = state.TY.passengers[attTeam.id].length;
                        if (attTeam.amounted === "Mounted Assault: 1P/4+, 2P/3+") {
                            if (passengerNumber === 1) {needed = 4};
                            if (passengerNumber > 1) {needed = 3};
                        }
                        if (attTeam.amounted === "Mounted Assault: 1P+/5+") {
                            needed = 5;
                        }
//others here later 
                    }
                }
                let roll = randomInteger(6);
                if (roll < needed) {
                    end = " Misses";
                } else {
                    let targNum = 0;
                    let facing = "Side/Rear";
                    let tIDs = attTeam.assaultTargetIDs;
                    if (tIDs.length > 1) {    
                        for (let t=0;t<(tIDs.length-1);t++) {
                            let t1 = TeamArray[tIDs[t]];
                            let num1 = t1.hitArray.length;
                            let t2 = TeamArray[tIDs[t+1]];
                            let num2 = t2.hitArray.length;
                            if (num2 < num1) {
                                targNum = (t+1);
                                break;
                            }
                        }
                    }
                    let targetTeam = TeamArray[tIDs[targNum]];
                    end = " Hits " + targetTeam.name;
                    if (targetTeam.type === "Tank") {
                        let wpnNum = parseInt(attTeam.assaultWpn);
                        if (wpnNum < 5) {
                            weapon = attTeam.weaponArray[attTeam.assaultWpn];
                            if (weapon.notes.includes("Limited")) {
                                let num = 0;
                                let wn = weapon.notes.split(",");
                                for (let i=0;i<wn.length;i++) {
                                    if (wn[i].includes("Limited")) {
                                        num = wn[i].replace(/[^0-9]+/g, "");
                                    }
                                }
                                if (limited >= num) {
                                    wpnNum = 5; //used the limited # already
                                } else {
                                    limited++;
                                }
                            }
                        }
                        if (wpnNum === 5) {
                            weapon = {
                                name: Nations[attTeam.nation].atWeapon,
                                minRange: 1,
                                maxRange: 1,
                                halted: 1,
                                moving: 1,
                                at: 2,
                                fp: 1,
                                notes: " ",
                                type: "Handheld AT",
                            }
                            facing = "Top";
                        }
                    } else if (targetTeam.type !== "Tank" && attTeam.type === "Tank") {
                        weapon.name = "MGs and Tank Treads"
                    }
                    hit = {
                        weapon: weapon,
                        bp: false,
                        facing: facing,
                        range: 1,
                        shooterID: attTeam.id,
                        shooterType: attTeam.type,
                        rangedIn: false,
                        closeCombat: true,
                        special: "nil",
                    }
                    targetTeam.hitArray.push(hit);
                    end += ' w/ ' + weapon.name;
                    bracket1 = "[#ff0000]";
                    bracket2 = "[/#]";
                }            

                line = '[🎲](#" class="showtip" title="Roll: ' + roll + " vs " + needed + '+ )' + bracket1 + attTeam.name + end + bracket2;
            }
            outputCard.body.push(line)
        }
        PrintCard(); //outputs the hits
        //Process Saves for defenders and output these
        //print card for saves here if needed, have pinning in saves also

        //See if remaining defenders
        let finalDUnitIDs = [];
        for (let i=0;i<defendingUnitIDs.length;i++) {
            let unit = UnitArray[defendingUnitIDs[i]];
            if (!unit) {continue};
            finalDUnitIDs.push(unit.id);
        }
        let combatOver = true;
        if (finalDUnitIDs.length > 0) {
            for (let i=0;i<attackingTeamIDs.length;i++) {
                let team1 = TeamArray[attackingTeamIDs[i]];
                for (let j=0;j<defendingTeamIDs.length;j++) {
                    let team2 = TeamArray[defendingTeamIDs[j]];
                    if (!team2) {continue};
                    if (team2.type === "Unarmoured Tank") {continue}; //cant counterattack
                    let dist = team1.hex.distance(team2.hex);
                    if (team2.type === "Tank" && team1.hex.dash > 2) {continue}; //cant counterattack into that terrain
                    if (dist <= (4*gameScale) && team2.bailed === false) {
                        combatOver = false;
                        break;
                    }
                }
            }
        }

        if (combatOver === true) {
            SetupCard("Assault Over","",attackingNation);
            outputCard.body.push("The Assault is Over");
            outputCard.body.push("Any surviving Losing Teams must move at Tactical speed the shortest distance to be further than " + 6*gameScale + '" away from all enemy Teams');
            outputCard.body.push("Any Teams not able to do so surrender and are destroyed");
            outputCard.body.push("The Winning Teams may Consolidate " + 4*gameScale + '", this Move may not bring them within ' + 2*gameScale + '" of an enemy Team.')  
            let teamKeys = Object.keys(TeamArray);
            for (let i=0;i<teamKeys.length;i++) {
                let team = TeamArray[teamKeys[i]];
                team.set(SM.defensive,false);
                team.set(SM.surprised,false);
                CCTeamIDs = [];
                assaultingUnitID = "";
            }
        } else {
            let noun = "The ";
            SetupCard("Counterattack","",defendingNation);
            outputCard.body.push("The Defenders may now choose to Counterattack");
            outputCard.body.push("One roll is made and compared to each Units Counterattack");
            outputCard.body.push("Any failing must Break Off")
            outputCard.body.push("Breaking Off Teams must move at Tactical speed the shortest distance to be further than " + 6*gameScale + '" away from all Assaulting Teams');
            outputCard.body.push("Any Teams not able to do so surrender and are destroyed");
            outputCard.body.push("The Winning Teams may Consolidate " + 4*gameScale + '", this Move may not bring them within ' + 2*gameScale + '" of an enemy Team.');
            outputCard.body.push("[hr]");
            for (let i=0;i<finalDUnitIDs.length;i++) {
                let unit = UnitArray[finalDUnitIDs[i]];
                let unitLeader = TeamArray[unit.teamIDs[0]];
                let reroll = CommandReroll(unitLeader);
                let rerollText = "";
                if (reroll > 0) {
                    rerollText = " (Reroll allowed)"
                }
                let needed = unitLeader.counterattack;
                if (unitLeader.special.includes("Mounted Assault")) {
                    if (state.TY.passengers[unitLeader.id]) {
                        let passengerNumber = state.TY.passengers[unitLeader.id].length;
                        if (passengerNumber > 0) {
                            needed = unitLeader.camounted;
                        }
//others here later
                    }
                }
                outputCard.body.push(unit.name + ": " + needed + "+" + rerollText);
            }
        }
        PrintCard();
    }

    const PlaceInReserve = (msg) => {
        if (!msg.selected) {return};
        SetupCard("Place in Reserve","","Neutral");
        for (let i=0;i<msg.selected.length;i++) {
            let id = msg.selected[i]._id;
            let team = TeamArray[id];
            if (!team) {continue};
            let unit = UnitArray[team.unitID];
            if (unit.inReserve === true) {continue};
            unit.inReserve = true;
            let unitLeader = TeamArray[unit.teamIDs[0]];
            unitLeader.token.set("aura1_color",Colours.purple);
            outputCard.body.push(unit.name + " is Placed in Reserve");
        }
        PrintCard();
    }

    const BuildReserve = () => {
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            let unit = UnitArray[keys[i]];
            if (unit.type === "System Unit") {continue}
            let unitLeader = TeamArray[unit.teamIDs[0]];
            if (!unitLeader) {
                log("In Build Reserve")
                log(unit)
                continue;
            }
            let offboard = hexMap[unitLeader.hexLabel].terrain.includes("Offboard");
            if (unitLeader.token.get("aura1_color") === Colours.purple && offboard === true) {
                unit.inReserve = true;
            }
        }
    }
    
    const ResetAuras = (player) => {
        let unitKeys = Object.keys(UnitArray);
        for (let i=0;i<unitKeys.length;i++) {
            let unit = UnitArray[unitKeys[i]];
            if (unit.player !== player || unit.type === "System Unit") {continue};
            let unitLeader = TeamArray[unit.teamIDs[0]];
            if (unitLeader) {
                let colour = (unit.pinned() === false) ? Colours.green:Colours.yellow;
                unitLeader.token.set("aura1_color",colour);
            }
        }
    }

    const Mount = (msg) => {
        let Tag = msg.content.split(";");
        let passengerID = Tag[1];
        let transportID = Tag[2];
        let passengerTeam = TeamArray[passengerID];
        let transportTeam = TeamArray[transportID];
        SetupCard(passengerTeam.name,"Mount",passengerTeam.nation);
        let errorMsg;
        let distance = passengerTeam.hex.distance(transportTeam.hex);
        if (state.TY.step !== "Movement") {
            errorMsg = "Teams can only Mount in the Movement Phase";
        }
        if (transportTeam.maxPass === 0) {
            errorMsg = "Not a Transport or Tank";
        }
        if (distance > 1) {
            errorMsg = "Need to be Adjacent to Transport";
        }
        if (!state.TY.passengers[transportID]) {
            state.TY.passengers[transportID] = [];
        }
        let passengers = state.TY.passengers[transportID];
        let room = parseInt(transportTeam.maxPass) - parseInt(passengers.length);
        if (room < 1) {
            errorMsg = "No More Room";
        }
        if (errorMsg !== undefined) {
            outputCard.body.push(errorMsg);
            PrintCard();
            return;
        }
        passengers.push(passengerID);
        if (passengers.length === 1) {
            //after first, dont need to add icon
            transportTeam.addCondition("Passengers");
        }
        state.TY.passengers[transportID] = passengers;
        //move passengerTeam token to lighting layer
        passengerTeam.token.set("layer","walls");

        outputCard.body.push(passengerTeam.name + " Loaded");
        outputCard.body.push(transportTeam + " has " + (room-1) + " Transport Left");
        PrintCard();
    }

    const Dismount = (msg) => {
        let id = msg.selected[0]._id;
        let transportTeam = TeamArray[id];
        let passengers;
        SetupCard(transportTeam.name,"Dismount",transportTeam.nation);
        if (state.TY.step !== "Movement") {
            outputCard.body.push("Can only Dismount in the Movement Step");
            PrintCard();
            return;
        }
        if (!state.TY.passengers[id]) {
            outputCard.body.push("No Passengers");
        } else {
            passengers = state.TY.passengers[id];
            for (let i=0;i<passengers.length;i++) {
                let passengerTeam = TeamArray[passengers[i]];
                passengerTeam.token.set("layer","objects");
                toFront(passengerTeam);
            }
            transportTeam.removeCondition("Passengers");
            state.TY.passengers[id] = [];
            outputCard.body.push("Teams can be Activated");
            outputCard.body.push("Orders must include Movement so that the Team moves away from the Transport");
        }
        PrintCard();
    }

    const PlaceInFoxholes = (msg) => {
        let id = msg.selected[0]._id;
        let team = TeamArray[id];
        let unit = UnitArray[team.unitID];
        DigIn(unit);
    }

    const changeGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            RemoveLines();
            log(tok.get("name") + " moving");
            if ((tok.get("left") !== prev.left) || (tok.get("top") !== prev.top)) {
                let team = TeamArray[tok.id];
                let newLocation = new Point(tok.get("left"),tok.get("top"));
                let newHex = pointToHex(newLocation);
                let newHexLabel = newHex.label();
                newLocation = hexToPoint(newHex); //centres it in hex
                tok.set({
                    left: newLocation.x,
                    top: newLocation.y,
                });

                if (!team) {return};

                let unit = UnitArray[team.unitID];
                let unitLeader = TeamArray[unit.teamIDs[0]];

                let oldHexLabel = team.hexLabel;
                let oldLocation = team.location;

                let moveBack = team.bailed;
                if ((team.type === "Tank" || team.type === "Unarmoured Tank") && hexMap[newHexLabel].dash === 3) {
                    moveBack = true;
                }
                if (hexMap[newHexLabel].dash === 4) {
                    moveBack = true;
                }
                let ccError = InCC(team);
                if (moveBack === true || ccError === true) {
                    PlaySound("No");
                    tok.set("height",prev.height);
                    tok.set("width",prev.width);
                    tok.set("left",prev.left);
                    tok.set("top",prev.top);
                    tok.set("rotation",prev.rotation);
                    return;
                }

                team.hex = newHex;
                team.hexLabel = newHexLabel;
                team.location = newLocation;
                let index = hexMap[oldHexLabel].teamIDs.indexOf(tok.id);
                if (index > -1) {
                    hexMap[oldHexLabel].teamIDs.splice(index,1);
                }
                hexMap[newHexLabel].teamIDs.push(tok.id);
                inCommand(team);
                if (state.TY.passengers[tok.id]) {
                    //carrying passengers
                    let passengers = state.TY.passengers[tok.id];
                    for (let p=0;p<passengers.length;p++) {
                        let passengerTeam = TeamArray[passengers[p]];
                        passengerTeam.token.set({
                            left: newLocation.x,
                            top: newLocation.y,
                        })
                        passengerTeam.hex = newHex;
                        passengerTeam.hexLabel = newHexLabel;
                        passengerTeam.location = newLocation;
                        let index = hexMap[oldHexLabel].teamIDs.indexOf(passengerTeam.id);
                        if (index > -1) {
                            hexMap[oldHexLabel].teamIDs.splice(index,1);
                        }
                        hexMap[newHexLabel].teamIDs.push(passengerTeam.id);
                    }
                }

                if (state.TY.turn > 0) {
                    if (team.hexLabel !== team.prevHexLabel) {
                        if (team.moved === false) {
                            team.moved = true;
                            if (team.order === "Tactical") {
                                team.addCondition("Tactical")
                            } else if (team.order === "Dash") {
                                team.addCondition("Dash")
                            } else if (team.order === "Assault") {
                                team.addCondition("Assault")
                            }
                        }
                    } else if (team.hexLabel === team.prevHexLabel) {
                        if (team.moved === true) {
                            team.moved = false;
                            if (team.order === "Hold" && team.fired === false) {
                                team.addCondition("GTG")
                                team.gonetoground = true;
                            }
                        }
                    }
     
                    if (team.moved === true) {
                        team.removeCondition("GTG")
                        team.gonetoground = false;
                        if (team.artillery !== undefined) {
                            RemoveRangedInMarker(team.unitID);
                        }
                        if (team.order === "") {
                            let defaultOrder;
                            if (state.TY.step === "Assault") {
                                defaultOrder = "Assault";
                            } else {
                                defaultOrder = "Tactical";
                            }
                            let noun = "Unit ";
                            if (unit.order === "") {
                                unit.order = defaultOrder;
                                for (let t=0;t<unit.teamIDs.length;t++) {
                                    let uTeam = TeamArray[unit.teamIDs[t]];
                                    if (t===0) {uTeam.token.set("aura1_color",Colours.black)}
                                    if (uTeam.inCommand === true || unit.inReserve === true) {
                                        uTeam.order = defaultOrder;
                                        uTeam.addCondition(defaultOrder);
                                    }
                                }
                            } else if (team.inCommand === false) {
                                noun = "Team "
                                team.order = defaultOrder;
                                team.addCondition(defaultOrder);
                            }
                            sendChat("",noun + "Order defaulted to " + defaultOrder);
                        }
                        if (state.TY.turn > 0 && state.TY.step === "Start") {
                            state.TY.step = "Movement";
                            sendChat("","Advanced to Movement Step");
                        }
                    }
                }
            
                if (hexMap[team.prevHexLabel].terrain.includes("Offboard") && hexMap[newHexLabel].terrain.includes("Offboard") === false) {
                    unit.inReserve = false;
                    if (unit.order === "") {
                        unitLeader.token.set("aura1_color",Colours.green);
                    }
                } 

            };
/*
            if ((tok.get("height") !== prev.height || tok.get("width") !== prev.width) && state.CoC.labmode === false) {
                let team = TeamArray[tok.id];
                if (!team) {return};
                tok.set("height",prev.height);
                tok.set("width",prev.width);
            }
*/

        };
    };

    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
        switch(args[0]) {
            case '!Dump':
                log("STATE");
                log(state.TY);
                log("Terrain Array");
                log(TerrainArray);
                log("Hex Map");
                log(hexMap);
                log("Team Array");
                log(TeamArray);
                log("Unit Array");
                log(UnitArray);
                log("Formation Array");
                log(FormationArray);
                log("Ranged In Array");
                log(RangedInArray)
                log("CC Team IDs");
                log(CCTeamIDs);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!ClearState':
                ClearState();
                break;
            case '!Roll':
                RollD6(msg);
                break;
            case '!UnitCreation':
                UnitCreation(msg);
                break;
            case '!UnitCreation2':
                UnitCreation2(msg);
                break;
            case '!TestLOS':
                TestLOS(msg);
                break;
            case '!SetupGame':
                SetupGame(msg);
                break;
            case '!GM':
                GM();
                break;
            case '!Activate':
                ActivateUnit(msg);
                break;
            case '!SpecialOrders':
                SpecialOrders(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!Cross':
                Cross(msg);
                break;
            case '!AdvanceStep':
                AdvanceStep();
                break;
            case '!RemountChecks':
                RemountChecks();
                break;
            case '!RallyChecks':
                RallyChecks();
                break;
            case '!FieldPromotions':
                FieldPromotions();
                break;
            case '!MoraleChecks':
                MoraleChecks();
                break;
            case '!RollD6':
                RollD6(msg);
                break;        
            case '!Shooting':
                Shooting(msg);
                break;    
            case '!CreateBarrages':
                CreateBarrages(msg);
                break;
            case '!BarrageLOS':
                BarrageLOS(msg);
                break;
            case '!Artillery':
                Artillery(msg);
                break;
            case '!PlaceRangedIn':
                PlaceRangedIn(msg);
                break;
            case '!FinalizeRangedIn':
                FinalizeRangedIn(msg);
                break;
            case '!CloseCombat':
                CloseCombat(msg);
                break;
            case '!CloseCombatTwo':
                CloseCombatTwo(msg);
                break;
            case '!PlaceInReserve':
                PlaceInReserve(msg);
                break;
            case '!PlaceInFoxholes':
                PlaceInFoxholes(msg);
                break;
            case '!Mount':
                Mount(msg);
                break;
            case '!DismountPassengers':
                Dismount(msg);
                break;
            case '!Test':
                Test(msg);
                break;
            case '!EndFire':
                EndFire(msg);
                break;
        }
    };

















    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        //on('destroy:graphic',destroyGraphic);
    };

    on('ready', () => {
        log("===> Flames of War v4 <===");
        log("===> Software Version: " + version + " <===");
        LoadPage();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready, Map Loaded")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };
})();