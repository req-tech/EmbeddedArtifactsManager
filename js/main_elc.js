// Initialize GLOBAL variables
const widgetHandler = {
    selArtRef: [],
    allLinks: [],
    targetContext: "base", // default context
    selectAllLinks: false,
};

// Subscribe to artifact selection event
RM.Event.subscribe(RM.Event.ARTIFACT_SELECTED, onSelection);
RM.Event.subscribe(RM.Event.ARTIFACT_OPENED, onOpen);

let run = true;
// Allow to stop long lasting Module search operation
function stopRun() {
    run = false;
    toggleElementVisibility('stopRunContainer', 'none');
}

// Function to handle artifact selection event
function onSelection(artifacts) {
    widgetHandler.selArtRef = artifacts || [];
    widgetHandler.allLinks = [];
}

function onOpen(artifact) {
    // alert('Artifact Opened');
    widgetHandler.selArtRef = [];
    widgetHandler.allLinks = [];
}

// Function to adjust the window height
function adjustHeight() {
    gadgets.window.adjustHeight();
}

// Function to execute when body loads
function onBodyLoad() {
    loadLanguage(); // Load the text according to the language file set in main.xml
    // alert(RM.Data.Formats.WRAPPED);
    adjustHeight();
}

// Function to programmatically click the right panel Refresh button
function clickRefreshButton() {
    // Select the button using its Title attribute
    const buttonElement = top.document.querySelector('[title="Refresh"]');
    buttonElement.click();
    toggleElementVisibility('reloadContainer', 'none');
    setContainerText("statusContainer", '');
    setContainerText("moduleStatusContainer", '');
    widgetHandler.selArtRef = [];
    widgetHandler.allLinks = [];
}

// Function to programmatically click the right panel Refresh button
function initWidget() {
    // Select the button using its Title attribute
    toggleElementVisibility('reloadContainer', 'none');
    toggleElementVisibility('stopRunContainer', 'none');
    setContainerText("statusContainer", '');
    setContainerText("moduleStatusContainer", '');
    // widgetHandler.selArtRef = [];
    widgetHandler.allLinks = [];
}

// display the instructions on/off
function show_instructions() {
    // instructions is not visible toggle on, if visible toggle off
    if (document.getElementById("instructions_div").style.display === "none") {
        toggleElementVisibility('instructions_div', 'block');
    } else {
        toggleElementVisibility('instructions_div', 'none');
    }
}

// display the instructions on/off
function show_settings() {
    // instructions is not visible toggle on, if visible toggle off
    // alert(document);
    if (document.getElementById("settings_div").style.display === "none") {
        toggleElementVisibility('settings_div', 'block');
    } else {
        toggleElementVisibility('settings_div', 'none');
    }
}

// Function to show or hide HTML elements
function toggleElementVisibility(elementId, displayStyle) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = displayStyle;
        adjustHeight();
    } else {
        console.error(`${elementId} not found`);
    }
}

// Function to toggle the visibility of a div and update button text
function toggleVisibility(divId, buttonId, showText, hideText) {
    const div = document.getElementById(divId);
    const button = document.getElementById(buttonId);
    if (div.classList.contains("hidden")) {
        div.classList.remove("hidden");
        button.innerHTML = hideText;
    } else {
        div.classList.add("hidden");
        button.innerHTML = showText;
    }
    adjustHeight();
}

// Function to set container text
function setContainerText(containerId, string) {
    const container = document.getElementById(containerId);
    container.innerHTML = string;
    adjustHeight();
}

// Function to create an ArtifactRef object
function createArtifactRef(uri, componentUri, moduleUri, format) {
    return new Promise((resolve, reject) => {
        try {
            const artifactRef = new RM.ArtifactRef(uri, componentUri, moduleUri, format);
            resolve(artifactRef);
        } catch (error) {
            reject(error);
        }
    });
}

// Function to handle the Read Links button click, artifactRef is a list of artifact references
async function analyzeArtifact(baseStartRefUri, primaryText, componentUri, format, currentServer) {
    // console.log('baseStartRefUri:', JSON.stringify(baseStartRefUri));
    return new Promise(async (resolve, reject) => {
        try {
            let totalEmbeds = 0;
            // Create a URL pattern to match URLs in the text that can be Wrapped Artifacts
            const urlPattern = /https?:\/\/[^\s"'>]+/g;
            // Extract all URLs
            const urls = primaryText.match(urlPattern);
            // Check if the urls is not empty
            if (urls) {
                // Filter URLs to only include those from the same server and containing 'rm/wrappedResources'
                const filteredUrls = urls.filter(url => url.startsWith(currentServer) && (url.toLowerCase().includes('/wrappedresources') || url.toLowerCase().includes('/resources')));
                console.log('Found Wrapped items: ', filteredUrls.length);
                // Loop through the filtered wrapped URLs
                for (let j = 0; j < filteredUrls.length; j++) {
                    // Get the URI of the wrapped item
                    const embeddedArtifactUri = filteredUrls[j].split('?')[0];
                    let targetUri = embeddedArtifactUri;
                    let targetArtifactRef = new RM.ArtifactRef(targetUri, componentUri, null, format);
                    // if the URL contains 'wrappedResources' replace it with 'resources'
                    if (embeddedArtifactUri.includes('wrappedResources')) {
                        targetUri = embeddedArtifactUri.replace('wrappedResources', 'resources');
                        targetArtifactRef = new RM.ArtifactRef(targetUri, componentUri, null, RM.Data.Formats.WRAPPED);
                    }
                    // Create a new ArtifactRef object    
                    const textArtifactRef = new RM.ArtifactRef(baseStartRefUri, componentUri, null, format);

                    await getLinksRaw(textArtifactRef).then(async (response) => {
                        let linkExists = false;
                        // console.log('ResponseLenght' + response.length );
                        for (let i = 0; i < response.length; i++) { 
                            for (let j = 0; j < response[i].targets.length; j++) {
                                if (!response[i].targets[j] || !response[i].targets[j].uri) {
                                    // Skip this iteration if targets[j] or targets[j].uri is not defined
                                    continue;
                                }
                                const baseTargetUri = targetUri;
                                let moduleltUri = RM.Data.LinkTypes.EMBEDS.uri; // Default value 'http://www.ibm.com/xmlns/rdm/types/Embedding'
                                let baselt = response[i].linktype;

                                if ( response[i].targets[j].uri === baseTargetUri && baselt.uri === moduleltUri) {
                                    linkExists = true;
                                    console.log('Base link already exists, skipping creation:', response[i].targets[j].uri, 'with base target:', baseTargetUri);
                                    break;
                                }   
                            }
                        }
                        if (!linkExists) {
                            // const linktypeDng = new RM.LinkTypeDefinition( linktype.uri, linktype.direction ) ;
                            console.log('Found unlinked Embed.', textArtifactRef.uri, 'to', targetArtifactRef.uri);
                            widgetHandler.allLinks.push([textArtifactRef, targetArtifactRef]); // Push Baselinks directly to the list
                            totalEmbeds++;
                        }
                    });
                }
            }
            resolve(totalEmbeds);
        } catch (error) {
            reject(error);
        }
    });
}

// Function getLinksRaw that just returns the links
function getLinksRaw(artifact) {
    return new Promise(async (resolve, reject) => {
        try {
            await RM.Data.getLinkedArtifacts(artifact, function(response) {
                if (response && response.code === RM.OperationResult.OPERATION_OK) {
                    const links = response.data.artifactLinks;
                    if (!links || links.length === 0) {
                        resolve([]); // No links found
                    } else {
                        resolve(links);
                    }
                } else {
                    reject('Error fetching links. Please check the artifact URI or ensure the context is correct.');
                }
            });
        } catch (error) {
            console.error('Error in getLinksRaw:', error);
            reject(error);
        }
    });
}


// Function to read links of selected artifacts with await
async function readArtifact(artifactRef) {
    return new Promise((resolve, reject) => {
        RM.Data.getAttributes(artifactRef, [RM.Data.Attributes.PRIMARY_TEXT, RM.Data.Attributes.FORMAT], function(res) {
            if (res.code !== RM.OperationResult.OPERATION_OK) {
                reportError(res);
                reject(res);
            } else {
                // console.log('Artifact:', JSON.stringify(res));
                const format = res.data[0].values[RM.Data.Attributes.FORMAT];
                // console.log('Format:', format);
                if (format !== 'Text') {
                    console.log(format + ' Artifact is not a Text artifact. Skipping...');
                    if ( format === RM.Data.Formats.MODULE ) resolve('Module');
                    else if (format == undefined) console.log('Format is undefined: ' + JSON.stringify(res.data[0]));
                    else resolve(null); // Resolve with null to indicate skipping
                } else {
                    const primaryText = res.data[0].values[RM.Data.Attributes.PRIMARY_TEXT];
                    // console.log('Response:', JSON.stringify(primaryText));
                    resolve(primaryText);
                }
            }
        });
    });
}

// Function to update link context
async function updateLinkContext(start, linkType, target) {
    return new Promise((resolve, reject) => {
        RM.Data.createLink(start, linkType, target, function(response) {
            if (response.code !== RM.OperationResult.OPERATION_OK) {
                console.error('Error creating link:', response);
                reject(response);
            } else {
                console.log('Successfully created link between:', start, 'and', target);
                resolve();
            }
        });
    });
}

// Function to delete module links
async function deleteModuleLinks(start, linkType, target) {
    return new Promise((resolve, reject) => {
        RM.Data.deleteLink(start, linkType, target, function(response) {
            if (response.code !== RM.OperationResult.OPERATION_OK) {
                console.error('Error deleting link:', response);
                reject(response);
            } else {
                console.log('Successfully deleted link between:', start, 'and', target);
                resolve();
            }
        });
    });
}

// Function to get current URI correlator for Legacy URLs
function fetchCorrelatorData(url, headers, body) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
            credentials: "include" // Sends cookies for authentication
        })
        .then(response => {
            if (!response.ok) {
                console.log("Correlator error!:", response);
                reject(new Error(`HTTP error! Status: ${response.status}`));
            } else {
                return response.json(); // convert DNG object to regular json object
            }
        })
        .then(cdata => {
            console.log("Response:", cdata);
            resolve(cdata); // Resolve with the response data
        })
        .catch(error => {
            console.log("Error:", JSON.stringify(error));
            reject(error); // Reject with the error
        });
    });
}

// Resolve the Legacy Urls with correlator  https://www.ibm.com/support/pages/how-capture-current-url-over-legacy-ibm-doors-next-version-7x-forward
async function getCurrentUriCorrelator(legacyUrl) {
    // Get host Url from browser
    const hostUrl = window.location.origin;
    const url = `${hostUrl}/rm/correlator?mode=legacyToCurrent`;
    const fullUrl = window.location.href;
    const urlObj = new URL(fullUrl);
    const params = new URLSearchParams(urlObj.hash.substring(1)); // Extract parameters from the hash part of the URL
    const vvcConf = params.get('vvc.configuration'); // Ensure vvcConf is declared with const

    const headers = {
        "Content-Type": "application/json",
        "DoorsRP-Request-Type": "private",
        "vvc.configuration": vvcConf
    };

    const body = JSON.stringify([legacyUrl]); // Input passed dynamically
    console.log("Correlator Legacy Url:", body);

    try {
        const cdata = await fetchCorrelatorData(url, headers, body);
        return cdata; // Return response to the caller
    } catch (error) {
        throw error; // Rethrow for caller to handle
    }
}
// Function to get module binding
async function getModuleBinding(moduleUri) {
    console.log('Fetching module binding for:', moduleUri);
    try {
        const response = await fetch(`${moduleUri}/structure`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'DoorsRP-Request-Type': 'public 2.0'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch module binding. Response status: ' + JSON.stringify(response));
        }

        // Parse the JSON content from the response
        const data = await response.json(); // convert DNG object to regular json object
        let legacyArtifacts = 0;

        // Check if the data contains Legacy objects
        if (Array.isArray(data)) {
            console.log("Checking for Legacy items...");

            for (let index = 1; index < data.length; index++) {
                const item = data[index];
                if ( // Check if the URI or boundArtifact contains Legacy items, skip for new installations
                    ( !item.uri.includes("resources/I_") && !item.uri.includes("resources/TX_") && !item.uri.includes("resources/WR_")) ||
                    ( !item.boundArtifact.includes("resources/BI_") && !item.boundArtifact.includes("resources/TX_") && !item.boundArtifact.includes("resources/WR_"))
                ) { // Exclude known non-legacy items
                    // Get Legacy
                    legacyArtifacts++;
                    console.log(`Item ${index} contains Legacy item:`, item.uri);
                    setContainerText("moduleStatusContainer", `Found ${legacyArtifacts} of ${data.length-1} legacy artifacts in the module. Widget might fail to create links for these.`);
                    // if (index === 3) { // This is just to check the correlator for once
                        try {
                            const cdataUri = await getCurrentUriCorrelator(item.uri);
                            const cdataBinding = await getCurrentUriCorrelator(item.boundArtifact);
                            console.log('Correlator:', JSON.stringify(cdataUri));
                            // Update the uri value with the new value from cdata
                            const newUri = cdataUri[item.uri]; // Extract the new URI from the correlator response
                            const newBinding = cdataBinding[item.boundArtifact]; // Extract the new URI from the correlator response    
                            if (newUri) {
                                item.uri = newUri; // Update the item's URI
                            }
                            if (newBinding) {
                                item.boundArtifact = newBinding; // Update the item's boundArtifact
                            }
                        } catch (error) {
                            console.error('Error in getCurrentUriCorrelator:', error);
                        }
                    // }
                }
            }
        } else {
            console.log("No array found. Full Data:", data);
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Function to get bound artifact URI
function getBoundArtifactUri(artifactUri, moduleBindings) {
    const binding = moduleBindings.find(item => item.uri === artifactUri);
    if (binding && binding.boundArtifact) {
        return binding.boundArtifact;
    } else {
        return artifactUri;
    }
}

// Function to get links of an artifact
function getLinks(artifact) {
    return new Promise((resolve, reject) => {
        RM.Data.getLinkedArtifacts(artifact, function(response) {
            if (response && response.code === RM.OperationResult.OPERATION_OK) {
                // if response.data.artifactLinks.length is defined
                if (response.data.artifactLinks.length === 0) {
                    // console.log('No links found for artifact:');
                    resolve([]);
                } else {
                resolve(response.data.artifactLinks.filter(link => link.art.moduleUri != null && link.linktype.direction !== '_OBJ'));
                }
            } else {
                reject('Error fetching links. Please check the artifact URI or ensure the context is correct.');
            }
        });
    });
}

// Function with Promise to create missing links
async function createEmdedsLink(baseStartRef, embeddedArtRef) {
    return new Promise((resolve, reject) => {
        RM.Data.createLink(baseStartRef, RM.Data.LinkTypes.EMBEDS, embeddedArtRef, function(response) {
            if (response.code !== RM.OperationResult.OPERATION_OK) {
                console.error('Error creating link:', response);
                reject(response);
            } else {
                console.log('Successfully created link between:', baseStartRef, 'and', embeddedArtRef);
                resolve(1);
            }
        });
    });
}

function updateStatusAndButtons(counts) {
    toggleElementVisibility('stopRunContainer', 'none');
    console.log('Total Links:', counts.totalLinks, 'Total Artifacts:', counts.totalArtifacts, 'Total Modules:', counts.totalModules);
    // Handle pluralization
    let linkOrLinks = 'links';
    let artifactOrArtifacts = 'artifacts';
    let moduleOrModules = 'modules';
    let moduleInfo = '';
    if (counts.totalLinks === 1) { linkOrLinks = 'link'; }
    if (counts.totalArtifacts === 1) { artifactOrArtifacts = 'artifact'; }
    if (counts.totalModules === 1) { moduleOrModules = 'module'; }
    if (counts.totalModules !== 0) { moduleInfo = ` in ${counts.totalModules} ${moduleOrModules} `; }

    setContainerText("statusContainer", `Found ${counts.totalLinks} missing ${linkOrLinks} for ${counts.totalArtifacts} ${artifactOrArtifacts} scanned${moduleInfo}.`);
    if ( counts.totalLinks !== 0) {
        // setContainerText("moduleStatusContainer", `Click Create Links Button to create missing links.`);
        toggleElementVisibility('createLinksContainer', 'block');
    } else {
        setContainerText("moduleStatusContainer", ``);
        toggleElementVisibility('createLinksContainer', 'none');
    }

}

// This is the Main Funtion !!!
function readAllLinks(artifactRef, moduleBinding) {
    toggleElementVisibility('stopRunContainer', 'block');
    toggleElementVisibility('createLinksContainer', 'none');
    run = true;
    return new Promise(async (resolve, reject) => {
        try {
            // setContainerText("statusContainer", 'Loading...');
            // counter for successful link creation and unsuccessful link creation
            let totalLinks = 0;
            let totalArtifacts = 0;
            let mixedList = '';
            // Get the current server's origin (protocol, hostname, and port)
            const currentServer = window.location.origin;

            for (let i = 0; i < artifactRef.length; i++) {
                if (!run) {
                    setContainerText("moduleStatusContainer", 'Stopped.');
                    return 'Stopped';
                }
                // console.log('Processing Artifact:', JSON.stringify(artifactRef[i]));
                try {
                    if (moduleBinding.length === 0 && artifactRef[i].moduleUri) {
                        const moduleUri = artifactRef[i].moduleUri;
                        moduleBinding = await getModuleBinding(moduleUri);
                    }

                    const primaryText = await readArtifact(artifactRef[i]);
                    // console.log('Primary Text:', primaryText, primaryText == 'Module' );
                    if ( primaryText == RM.Data.Formats.MODULE ) {
                        mixedList = 'You have modules mixed with artifacts in selection';
                        alert(`You have modules mixed in artifact selection. Please select artifacts or Use Selected Modules Button.`);
                        totalArtifacts++;
                        continue;
                    }

                    if (!primaryText) {
                        console.log('Primary text not found.');
                        totalArtifacts++;
                        let linkOrLinks = 'links';
                        let artifactOrArtifacts = 'artifacts';
                        if (totalLinks === 1) { linkOrLinks = 'link'; }
                        if (totalArtifacts === 1) { artifactOrArtifacts = 'artifact'; }
                        setContainerText("statusContainer", `Found ${totalLinks} missing ${linkOrLinks} for ${totalArtifacts} ${artifactOrArtifacts} scanned. ${mixedList}`);
                        continue; // Skip to the next artifact
                    }

                    const startRef = artifactRef[i]; // This is processed only when selected Artifact contains correct data.
                    let baseStartUri = startRef.uri;
                    // if module binding then get the bound artifact URI
                    if (moduleBinding) { // This is the case when the selected Artifact is not Base artifact.
                        baseStartUri = getBoundArtifactUri(baseStartUri, moduleBinding);
                    }   
                    totalArtifacts++;
                    const embedsProcessed = await analyzeArtifact(baseStartUri, primaryText, startRef.componentUri, "Text", currentServer);
                    totalLinks += embedsProcessed;
                    // Handle pluralization
                    let linkOrLinks = 'links';
                    let artifactOrArtifacts = 'artifacts';
                    if (totalLinks === 1) { linkOrLinks = 'link'; }
                    if (totalArtifacts === 1) { artifactOrArtifacts = 'artifact'; }

                    setContainerText("statusContainer", `Found ${totalLinks} missing ${linkOrLinks} for ${totalArtifacts} ${artifactOrArtifacts} scanned. ${mixedList}`);
                } catch (error) {
                    console.error('Error fetching attributes:', error);
                    // totalModules++;
                }
            }
            toggleElementVisibility('stopRunContainer', 'none');
            resolve({ totalLinks, totalArtifacts });
        } catch (error) {
            reject(error);
        }
    });
}

// Function to get Module Binding ie. List of artifacts in the module
async function readWholeModule() {
    initWidget();
    let counts = { totalLinks: 0, totalArtifacts: 0, totalModules: 0 };
    toggleElementVisibility('createLinksContainer', 'none');
    // let totalModules = 0;
    const browserURLtop = window.parent.location.href;// Get the current browser URL
    if ( browserURLtop.includes('showArtifactPage' )) {
        RM.Client.getCurrentArtifact(async function(res) {
            if (res.code !== RM.OperationResult.OPERATION_OK) {
                console.log('Error:', res);
                return;
            }
            const jsonObject = res;
            // console.log('Response:', JSON.stringify(jsonObject));
            
            // Extract the format information
            const format = jsonObject.data?.ref?.format;
            const artifactFormat = jsonObject.data?.values[RM.Data.Attributes.FORMAT];
            
            // Check if it is of type "Module"
            if (format && artifactFormat === RM.Data.Formats.MODULE) {
                console.log("This is a type of Module.");
            } else {
                alert("You are not in a Module View.");
                return;
            }
            console.log('Module URI:', jsonObject.data?.ref?.uri);
            const moduleUri = jsonObject.data?.ref?.uri;
            const moduleBinding = await getModuleBinding(moduleUri);
            // console.log('Module Binding:', JSON.stringify(moduleBinding));
            const componentUri = jsonObject.data?.ref?.componentUri;          
            // Create Artifact Ref for each artifact in the module so that their PRIMARY_TEXT can be read 
            let artifactRef = [];
            for (const artifact of moduleBinding) {
                // if artifact.uri isHeading value is not true and artifact's isStructureRoot is not true
                if (!artifact.isHeading && !artifact.isStructureRoot) {
                    // Create an ArtifactRef object sub function to enable await
                    const textArtifactRef = await createArtifactRef(artifact.uri, componentUri, moduleUri, RM.Data.Formats.TEXT);
                    artifactRef.push(textArtifactRef);
                    // console.log('Text Artifact Uri:', JSON.stringify(textArtifactRef.uri));
                } else if (artifact.isHeading) {
                    counts.totalArtifacts++; // Increment the total artifacts count for Headings
                }
            }
            // console.log('Text Artifact Array:', JSON.stringify(artifactRef)); 
            const resultCounts = await readAllLinks(artifactRef, moduleBinding);
            if (resultCounts === 'Stopped') {
                setContainerText("statusContainer", 'Stopped.');
                return;
            }
            counts.totalLinks += resultCounts.totalLinks;
            counts.totalArtifacts += resultCounts.totalArtifacts;
            counts.totalModules++;

            updateStatusAndButtons(counts);
        });
    } else {
        alert('Open a Module to use this feature.');
    }
}

async function readSelectedLinksOnClick() {
    initWidget();
    setContainerText("moduleStatusContainer", '');
    let counts = { totalLinks: 0, totalArtifacts: 0, totalModules: 0 };
    // Check that there are objects in the artifactRef
    if (widgetHandler.selArtRef.length === 0) { // When clicking the button get [] as artifactRef
        // console.log('Processing selected artifacts.');
        alert('No artifacts selected. Select Artifacts from Module or Project View.');
        return;
    } 
    // Read links of the array of selected artifacts
    const resultCounts = await readAllLinks(widgetHandler.selArtRef, []);
    if (resultCounts === 'Stopped') {
        setContainerText("statusContainer", 'Stopped.');
        return;
    }
    counts.totalLinks += resultCounts.totalLinks;
    counts.totalArtifacts += resultCounts.totalArtifacts;
    updateStatusAndButtons(counts);
}

async function readAllModulesButtonOnClick() {
    initWidget();
    let counts = { totalLinks: 0, totalArtifacts: 0, totalModules: 0 };

    // Check that we are in Module listing view
    if (!widgetHandler.selArtRef || widgetHandler.selArtRef.length === 0) { 
        setContainerText("statusContainer", 'No Modules selected. Select Modules in Module listing View.');
        return;
    }

    setContainerText("moduleStatusContainer", 'Processing Modules...');
    // Loop through all selected modules
    for (let i = 0; i < widgetHandler.selArtRef.length; i++) {
        setContainerText("moduleStatusContainer", `Processing Module ${i + 1} of ${widgetHandler.selArtRef.length}.`);
        const moduleUri = widgetHandler.selArtRef[i].uri;
        const componentUri = widgetHandler.selArtRef[i].componentUri;
        const moduleBinding = await getModuleBinding(moduleUri);

        let artifactRef = [];
        // Loop through all artifacts in the module
        for (const artifact of moduleBinding) {
            // console.log('URI:', uri);
            // if artifact.uri isHeading value is not true and artifact's isStructureRoot is not true
            if (!artifact.isHeading && !artifact.isStructureRoot) {
                // Create an ArtifactRef object sub function to enable await
                const textArtifactRef = await createArtifactRef(artifact.uri, componentUri, moduleUri, 'Text');
                artifactRef.push(textArtifactRef);
                // Create one list for all item having embedded items
            } else if (artifact.isHeading) {
                counts.totalArtifacts++; // Increment the total artifacts count for Headings
            }
        }
        const resultCounts = await readAllLinks(artifactRef, moduleBinding);
        if (resultCounts === 'Stopped') {
            setContainerText("statusContainer", 'Stopped.');
            return;
        }
        counts.totalLinks += resultCounts.totalLinks;
        counts.totalArtifacts += resultCounts.totalArtifacts;
        counts.totalModules++;
    }

    updateStatusAndButtons(counts);
}

// Function to create missing links
async function createLinksOnClick() {
    // Check if there are any links to create
    toggleElementVisibility('createLinksContainer', 'none');
    toggleElementVisibility('stopRunContainer', 'block');
    setContainerText("moduleStatusContainer", `Note: Stop won't undo links already created`);
    if (widgetHandler.allLinks.length === 0) {
        alert('No missing links found. Run the analysis first.');
        return;
    }
    // console.log('All Links:', JSON.stringify(widgetHandler.allLinks));
    setContainerText("statusContainer", 'Creating links...');
    let totalLinks = 0;
    let totalModules = 0;
    for (let i = 0; i < widgetHandler.allLinks.length; i++) {
        if (!run) {
            setContainerText("moduleStatusContainer", 'Stopped.');
            break;
        }
        setContainerText("statusContainer", `Creating links... ${i + 1} of ${widgetHandler.allLinks.length}.`);
        console.log('Processing Artifact:', JSON.stringify(widgetHandler.allLinks[i]));
        try {
            const baseStartRef = widgetHandler.allLinks[i][0];
            const embeddedArtRef = widgetHandler.allLinks[i][1];
            const embedsProcessed = await createEmdedsLink(baseStartRef, embeddedArtRef);
            totalLinks += embedsProcessed;
            // Handle pluralization
            let linkOrLinks = 'links';
            if (totalLinks === 1) { linkOrLinks = 'link'; }
            setContainerText("statusContainer", `Created ${totalLinks} ${linkOrLinks}.`);
        } catch (error) {
            console.error('Error fetching attributes:', error);
            totalModules++;
        }
    }
    // Handle pluralization
    let linkOrLinks = 'links';
    if (totalLinks === 1) { linkOrLinks = 'link'; }
    setContainerText("statusContainer", `Created ${totalLinks} ${linkOrLinks}.`);
    setContainerText("moduleStatusContainer", '');
    toggleElementVisibility('reloadContainer', 'block');
    toggleElementVisibility('stopRunContainer', 'none');
    toggleElementVisibility('createLinksContainer', 'none');
}