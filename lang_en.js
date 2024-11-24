lang_json = `{
  "strings": [
    {
      "id": "str001",
      "text": "Show instructions"
    },
    {
      "id": "str002",
      "text": "Change settings"
    },
    {
      "id": "str003",
      "text": "How to use this widget?"
    },
    {
      "id": "str004b",
      "text": "This widget creates Embeds type links for Text artifacts that contain embedded images and other objects."
    },
    {
      "id": "str005a",
      "text": "Open the module or select Artifacts from list view."
    },
    {
      "id": "str006b",
      "text": "Select operation."
    },
    {
      "id": "str007a",
      "text": "Click Reload to see newly created Base Links."
    },
    {
      "id": "str008",
      "text": "Settings: "
    },
    {
      "id": "str009",
      "text": "This is a settings menu prototype. If you need a settings menu, you can use it. Otherwise, you should remove it."
    },
    {
      "id": "str010",
      "text": "Title(s):"
    },
    {
      "id": "str011",
      "text": "Print Text Artifacts Titles"
    }
  ],
  "codeStrings": {
    "cs001": "Hide instructions",
    "cs002": "Show instructions",
    "cs003": "Hide settings",
    "cs004": "Change settings"
  }
}`;

lang = JSON.parse(lang_json);

function loadLanguage()
{
    for (i = 0; i < lang.strings.length; i++) 
    {
        span = document.getElementById(lang.strings[i].id);
        if(span != null)
            span.textContent = lang.strings[i].text;
    }
}

function getLangString(id)
{
    return lang.codeStrings[id];
}


