UPDATE genograms SET data = '{
  "members": [
    {"age":34,"birthYear":1992,"firstName":"Hélène","gender":"female","genderIdentity":"cisgender","id":"m-1774190628239","isBisexual":false,"isDraft":false,"isGay":false,"isIndexPatient":true,"isPlaceholder":false,"isTransgender":false,"lastName":"Moreau","pathologies":["be34929f-f19e-42d4-a650-ae941186f752"],"profession":"Psychologue clinicienne","sexualOrientation":"heterosexual","x":-80,"y":100},
    {"age":63,"birthYear":1963,"deathYear":2018,"firstName":"Philippe","gender":"male","genderIdentity":"cisgender","id":"m-1774190628240","isAdoptiveParent":false,"isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Moreau","pathologies":["d73559c6-a9a5-4886-8c78-8b93840153f0"],"profession":"Chirurgien","sexualOrientation":"heterosexual","x":-320,"y":-240},
    {"age":64,"birthYear":1962,"firstName":"Catherine","gender":"female","genderIdentity":"cisgender","id":"m-1774190628241","isAdoptiveParent":false,"isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Duval","pathologies":[],"profession":"Institutrice","sexualOrientation":"heterosexual","x":660,"y":-240},
    {"age":37,"birthYear":1989,"firstName":"Antoine","gender":"male","genderIdentity":"cisgender","id":"m-1774190743763","isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Moreau","pathologies":[],"profession":"Architecte","sexualOrientation":"heterosexual","x":-340,"y":0},
    {"age":28,"birthYear":1998,"firstName":"Lucas","gender":"male","genderIdentity":"cisgender","id":"m-1774190781438","isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Moreau","pathologies":[],"profession":"Développeur web","sexualOrientation":"heterosexual","x":700,"y":260},
    {"age":30,"birthYear":1996,"firstName":"Maxime","gender":"male","genderIdentity":"cisgender","id":"m-1774190803830","isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Moreau","pathologies":[],"profession":"Avocat","sexualOrientation":"heterosexual","x":200,"y":180},
    {"age":86,"birthYear":1940,"birthYearUnsure":true,"deathYear":2009,"deathYearUnsure":true,"firstName":"Marcel","gender":"male","genderIdentity":"cisgender","id":"m-1774192041103","isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Duval","pathologies":[],"profession":"Agriculteur","sexualOrientation":"heterosexual","x":520,"y":-480},
    {"age":86,"birthYear":1940,"birthYearUnsure":true,"deathYear":2001,"firstName":"Madeleine","gender":"female","genderIdentity":"cisgender","id":"m-draft-1774192041104","isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Duval","pathologies":[],"profession":"Sage-femme","sexualOrientation":"heterosexual","x":800,"y":-480},
    {"age":31,"birthYear":1995,"firstName":"Camille","gender":"female","genderIdentity":"cisgender","id":"m-1774192844072","isBisexual":false,"isDraft":false,"isGay":false,"isPlaceholder":false,"isTransgender":false,"lastName":"Renard","pathologies":["d73559c6-a9a5-4886-8c78-8b93840153f0"],"profession":"Infirmière","sexualOrientation":"heterosexual","x":460,"y":180}
  ],
  "unions": [
    {"children":["m-1774190628239","m-1774190743763","m-1774190781438","m-1774190803830"],"eventYear":2012,"id":"u-1774190628239","isAdoption":false,"marriageYear":2012,"partner1":"m-1774190628240","partner2":"m-1774190628241","status":"separated"},
    {"children":["m-1774190628241"],"id":"u-1774192041103","partner1":"m-1774192041103","partner2":"m-draft-1774192041104","status":"married"},
    {"children":[],"eventYear":2026,"id":"u-1774192844072","marriageYear":2026,"partner1":"m-1774190803830","partner2":"m-1774192844072","status":"married"}
  ],
  "emotionalLinks": [
    {"from":"m-1774190628240","id":"el-1774192738605","to":"m-1774190803830","type":"conflictual"},
    {"from":"m-1774190628240","id":"el-1774192745305","to":"m-1774190628241","type":"distant"},
    {"from":"m-1774192041103","id":"el-1774192750955","to":"m-1774190628241","type":"fusional"}
  ]
}'::jsonb WHERE id = '19699c29-c509-4b45-b4a7-2173461fede9'