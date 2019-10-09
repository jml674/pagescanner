var  config = {
  "buildDir": "build/",
  "distDir": "dist/",
  "jscrambler": {
    "keys": {
      "accessKey": "TOMODIFY8373281D94FE53C622D47FE170754BF9DAC99",
      "secretKey": "TOMODIFYA3A0A3215F62823579253505D81AF5D92F4F",
    },
    "applicationId": "TOMODIFYef587350020b71c5a",
    "params": [{
        "name": "identifiersRenaming"
      },
      {
        "name": "whitespaceRemoval"
      },
      {
        "name": "booleanToAnything"
      },
      {
        "name": "numberToString",
        "options": {}
      },
      {
        "name": "charToTernaryOperator"
      },
      {
        "name": "deadCodeInjection"
      },
      {
        "name": "dotToBracketNotation"
      },
      {
        "name": "duplicateLiteralsRemoval"
      },
      {
        "name": "functionOutlining"
      },
      {
        "name": "stringSplitting"
      }
    ]
  },
  "flavors": {
    "public": {
      "name": "public",
      "Mname": "pagescanner",
      "Mdescription": "pagescanner",
      "Mhomepage_url": "https://pagescanner.com",
      "Mgecko_id": "pagescanner@pagescanner.com",
      "Mgecko_update_url": "https://pagescanner.com",
      "addonId":"32chars",
      "chromePublicKey":"\"key\":"+"\"//6ucRP2t/idtrLa8fTjliNiwwb/Yh5hN+LDIGZyhYGynExzHeCf7eF+1IMhAnAavGxDj+Xu+ugTb4glQF5gj8X7gUqDtHAMmNZ+DT/NoLecWN8R3d/DSTkcJOfrDpsuUk/0E4e28g7NCFT0j1WFW71NTmkWWnnWOVZTVLupmJ16SRdWskwSvlE2vEO4RmjR4C85mLd5+QTrV3T9bkFJufiLelGHiCpEsBg0hAHN2RfWImsMPjbMWQPzyzbRxPdo82pTL2mQ7dvYkEndpEFmjOXle2BdVhMGvYk7detr46C6P9kpLmtUZnt5K0Zh+DAo1bbhpKwIDAQAB\","
    },
    "dev": {
      "name": "dev",
      "Mname": "pagescanner-dev",
      "Mdescription": "pagescanner-dev",
      "Mhomepage_url": "https://pagescanner.com",
      "Mgecko_id": "pagescanner-dev@pagescanner.com",
      "Mgecko_update_url": "https://pagescanner.com",
      "addonId":"32chars",
      "chromePublicKey":"\"key\":"+"\"//6ucRP2t/idtrLa8fTjliNiwwb/Yh5hN+LDIGZyhYGynExzHeCf7eF+1IMhAnAavGxDj+Xu+ugTb4glQF5gj8X7gUqDtHAMmNZ+DT/NoLecWN8R3d/DSTkcJOfrDpsuUk/0E4e28g7NCFT0j1WFW71NTmkWWnnWOVZTVLupmJ16SRdWskwSvlE2vEO4RmjR4C85mLd5+QTrV3T9bkFJufiLelGHiCpEsBg0hAHN2RfWImsMPjbMWQPzyzbRxPdo82pTL2mQ7dvYkEndpEFmjOXle2BdVhMGvYk7detr46C6P9kpLmtUZnt5K0Zh+DAo1bbhpKwIDAQAB\","
    },
  },
  "browsers": {
    "chrome": {
      "name": "chrome",
      "buildVariant": "",
      "dir": "chrome/",
      // chrome dashboard KEYS
      "clientId":"TOMODIFY-2i0bvurp1k4eo8fa2m0uj.apps.googleusercontent.com",
      "clientSecret":"TO-MODIFYzdm3RmbWVa807W",
      "refreshToken":"TO-MODIFY1/0KuWEWMz92Rfb2SKkqi_MFcBJPD0k",
    },
    "safari": {
      "name": "safari",
      "buildVariant": "",
      "dir": "safari/"
    },
    "firefox": {
      "name": "firefox",
      "buildVariant": "ff46",
      "dir": "firefox/",
      // AMO store keys
      "apiKey": "user:5:",
      "apiSecret": "2e4a37a84477de47d98551399"
    },
  }
};
exports.config = config;
