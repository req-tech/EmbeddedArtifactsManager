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
}

function onOpen(artifact) {
    // alert('Artifact Opened');
    widgetHandler.selArtRef = [];
}

// Function to adjust the window height
function adjustHeight() {
    gadgets.window.adjustHeight();
}

// Function to execute when body loads
function onBodyLoad() {
    loadLanguage(); // Load the text according to the language file set in main.xml
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

// Function for Dev actions, not in use now
async function devActions() {
    // console.log('Dev actions');
    // console.log('Artifact:', JSON.stringify(widgetHandler.selArtRef[0]));
    const responseData = await getAllArtifactsFromProject();
    // Loop through the results
    // console.log('Results:', responseData);
    // Iterate over each key-value pair in the response
    // for (const [key, value] of Object.entries(results)) {
    //     // Get the type information
    //     console.log('Key:', key);
    //     const typeInfo = value["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
        
    //     // Check if the type is "Requirement"
    //     if (typeInfo && Array.isArray(typeInfo)) {
    //         const isRequirement = typeInfo.some(
    //             item => item.value === "http://open-services.net/ns/rm#Requirement"
    //         );
    //         if (isRequirement) {
    //             console.log(`Requirement found: ${key}`);
    //         }
    //     }
    // }
    for (const key in responseData) {
        // console.log('Keyyy:', key);
        if (responseData.hasOwnProperty(key)) {
            const typeInfo = responseData[key]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
            
            // Check if the type matches "Requirement"
            if (typeInfo && Array.isArray(typeInfo)) {
                const isRequirement = typeInfo.some(
                    item => item.value === "http://open-services.net/ns/rm#Requirement"
                );
                if (isRequirement) {
                    console.log(`Requirement found: ${key}`);
                }
            }
        }
    }
}

// Function to get all artifacts from the entire project using OSLC
async function getAllArtifactsFromProject() {
    const projectUri = widgetHandler.selArtRef[0].componentUri;
    const projectUriParts = projectUri.split('/');
    const projectId = projectUriParts[projectUriParts.length - 1];
    const compUri = '_NO35cEqNEe-lXMAnwStbdQ'; //widgetHandler.selArtRef[0].componentUri;
    const project = '_Mks7EEqNEe-lXMAnwStbdQ';
    // console.log('Artifact:', JSON.stringify(widgetHandler.selArtRef[0]));

    try {
        // Get the current browser top level URL 
        const browserURLtop = window.parent.location.href;// Get the current browser URL
        const browserURL = window.location.href; // Get the current browser URL
        // console.log('Browser parent URL:', browserURLtop);
        const urlParts = browserURLtop.split('&');
        let componentUriOslc = '';
        if (urlParts[0].includes('showProjectDashboard')) {
            componentUriOslc = urlParts[1];
            console.log('Component OSLC:', componentUriOslc);
        }
        const url = new URL(browserURL);
        const baseUrl = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}/rm`;

        console.log('Project ID:', projectId, 'Base URL:', baseUrl);
        console.log('componentUri:', widgetHandler.selArtRef[0].componentUri);

        // Construct the query URL
        const oslcQuery = "oslc.query=true";
        const projectURL = `projectURL=${encodeURIComponent(`${baseUrl}/process/project-areas/${projectId}`)}`;
        const componentUriEncoded = `componentURI=${encodeURIComponent(`https://clm.celeris.se/rm/rm-projects/${project}/components/${compUri}`)}`;
        // const componentUriEncoded = `componentURI=${encodeURIComponent(`https://clm.celeris.se/rm/rm-projects/${compUri}/components/${compUri}`)};
        const vvc = `&vvc.configuration=${encodeURIComponent(`https://clm.celeris.se/rm/cm/stream/${compUri}`)}`;
        //  const vvc = `&vvc.configuration=${encodeURIComponent(`https://clm.celeris.se/rm/cm/stream/${compUri}`)}`;
        const oslcPrefix = encodeURIComponent("oslc.prefix=dcterms=<http://purl.org/dc/terms/>,rm_nav=<http://jazz.net/ns/rm/navigation#>");
        const oslcWhere = encodeURIComponent('oslc.where=dcterms:identifier=534');
        // const oslcWhere = encodeURIComponent('oslc.where=dcterms:modified>"2020-08-01T21:51:40.979Z"^^xsd:datetime');
        const oslcSelect = encodeURIComponent("oslc.select=dcterms:identifier,dcterms:title");
        // const oslcPaging = encodeURIComponent("oslc.paging=true");
        // const oslcPageSize = encodeURIComponent("oslc.pageSize=200");
        const oslcPaging = "oslc.paging=true";
        const oslcPageSize = "oslc.pageSize=200";

        // let queryUrl = `${baseUrl}/views?${oslcQuery}&${componentUriEncoded}${vvc}&${oslcPrefix}&${oslcWhere}&${oslcSelect}&${oslcPaging}&${oslcPageSize}`;
        let queryUrl = `${baseUrl}/views?${oslcQuery}&${componentUriOslc}&${oslcPrefix}&${oslcWhere}&${oslcSelect}&${oslcPaging}&${oslcPageSize}`;
        // let queryUrl = `${baseUrl}/views?${oslcQuery}&${projectURL}&${oslcPrefix}&${oslcWhere}&${oslcSelect}&${oslcPaging}&${oslcPageSize}`;
        console.log('Query URL:', queryUrl);
        // queryUrl = 'https://homie.byte.fi:9443/rm/views?oslc.query=true&projectURL=https%3A%2F%2Fhomie.byte.fi%3A9443%2Frm%2Fprocess%2Fproject-areas%2F_22yKMJFmEe-Oy5UELFqR4Q&oslc.prefix=dcterms%3D%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%2Crm_nav%3D%3Chttp%3A%2F%2Fjazz.net%2Fns%2Frm%2Fnavigation%23%3E&oslc.where=dcterms%3Amodified%3E%222020-08-01T21%3A51%3A40.979Z%22%5E%5Exsd%3Adatetime&oslc.select=dcterms%3Aidentifier%2Crm_nav%3Aparent&oslc.paging=true&oslc.pageSize=200';
        // alert('Curl  URL:' + queryUrl);

        // Perform the GET request
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                // 'Accept': 'application/rdf+xml',
                'Accept': 'application/json',
                'OSLC-Core-Version': '3.0' // Update to the version used in the curl command
            },
            credentials: 'include' // Ensures cookies are sent along with the request
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response Error:', errorText);
            throw new Error(`Failed to fetch artifacts: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.text();

        return responseData;
    } catch (error) {
        console.error('Error while fetching project artifacts:', error);
        return [];
    }
}

// Placeholder function for parsing artifacts from RDF/XML
function parseArtifactsFromRDF(rdfData) {
    // Implement the parsing logic here to extract artifact references from RDF/XML response
    return [];
}

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
                const filteredUrls = urls.filter(url => url.startsWith(currentServer) && url.toLowerCase().includes('rm/wrappedresources'));
                // console.log('Found Wrapped items: ', filteredUrls.length);
                // Loop through the filtered URLs
                for (let j = 0; j < filteredUrls.length; j++) {
                    // Get the URI of the wrapped item
                    const wrArtifactUri = filteredUrls[j].split('?')[0];
                    const targetUri = wrArtifactUri.replace('wrappedResources', 'resources');
                    // console.log('Wrapped Artifact URI:', targetUri);
                    // Create a new ArtifactRef object    
                    const textArtifactRef = new RM.ArtifactRef(baseStartRefUri, componentUri, null, format);
                    // console.log('Text Artifact Ref:', JSON.stringify(textArtifactRef));
                    const targetArtifactRef = new RM.ArtifactRef(targetUri, componentUri, null, 'WrapperResource');
                    // console.log('Wrapped Artifact Ref:', JSON.stringify(targetArtifactRef));
                    // Check if the link already exists
                    await getLinksRaw(textArtifactRef).then(async (response) => {
                        let linkExists = false;
                        // console.log('ResponseLenght' + response.length );
                        for (let i = 0; i < response.length; i++) { 
                            // Loop through all targets of the base artifact to check if the link already exists
                            // targets not necessarily exist in all links
                            // console.log('Response' + i, " ", JSON.stringify(response[i]), 'with base target:', baseTargetUri); 
    
                            for (let j = 0; j < response[i].targets.length; j++) {
                                if (!response[i].targets[j] || !response[i].targets[j].uri) {
                                    // Skip this iteration if targets[j] or targets[j].uri is not defined
                                    continue;
                                }
                                const baseTargetUri = targetUri;
                                let moduleltUri = 'http://www.ibm.com/xmlns/rdm/types/Embedding';
                                let moduledir = 'na';

                                let baselt = response[i].linktype;
                                let basedir = 'na';
                                
                                // console.log('TargetsLenght' + response[i].targets.length + 
                                //     ' Checking link:', response[i].targets[j].uri, 'with base target:', baseTargetUri,
                                //     'Module LinkType:', moduleltUri, 'Base LinkType:', baselt.uri, 'Module LinkDir:', moduledir, 'Base LinkDir:', basedir); 
                                // If Base link already exists with same linktype, skip creation
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
                            // await updateLinkContext(baseStartRef, linktypeDng, baseTargetRef);
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

// FunctiongetLinksRaw that just returns the links
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
                const format = res.data[0].values["http://www.ibm.com/xmlns/rdm/types/ArtifactFormat"];
                // console.log('Format:', format);
                if (format !== 'Text') {
                    console.log(format);
                    console.log('Artifact is not a Text artifact. Skipping...');
                    if (format === 'Module') resolve('Module');
                    else resolve(null); // Resolve with null to indicate skipping
                } else {
                    const primaryText = res.data[0].values["http://www.ibm.com/xmlns/rdm/types/PrimaryText"];
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

// Function to get module binding
function getModuleBinding(moduleUri) {
    return new Promise(async (resolve, reject) => {
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
                setContainerText('moduleStatusContainer','Artifacts and modules selected. Use Selected Items Button to process Text Format artifacts.');
                setContainerText("statusContainer", '');
                resolve(new Error('Failed to fetch module binding. Response status: ' + response.status));
            } else {
                const data = await response.json();
                resolve(data);
            }
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
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
                // console.log('Response:', JSON.stringify(response));
                if (response.data.artifactLinks.length === 0) {
                    // console.log('No links found for artifact:');
                    resolve([]);
                } else {
                resolve(response.data.artifactLinks.filter(link => link.art.moduleUri != null && link.linktype.direction !== '_OBJ'));
                }
                // resolve(response.data.artifactLinks);
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

    setContainerText("statusContainer", `Found ${counts.totalLinks} ${linkOrLinks} for ${counts.totalArtifacts} ${artifactOrArtifacts} scanned${moduleInfo}.`);
    if ( counts.totalLinks !== 0) {
        setContainerText("moduleStatusContainer", `Click Create Links Button to create missing links.`);
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
            // let totalModules = 0;
            let mixedList = '';
            // Get the current server's origin (protocol, hostname, and port)
            const currentServer = window.location.origin;

            for (let i = 0; i < artifactRef.length; i++) {
                if (!run) {
                    setContainerText("moduleStatusContainer", 'Stopped.');
                    break;
                }
                // console.log('Processing Artifact:', JSON.stringify(artifactRef[i]));
                try {
                    if (moduleBinding.length === 0 && artifactRef[i].moduleUri) {
                        const moduleUri = artifactRef[i].moduleUri;
                        moduleBinding = await getModuleBinding(moduleUri);
                    }

                    const primaryText = await readArtifact(artifactRef[i]);
                    // console.log('Primary Text:', primaryText, primaryText == 'Module' );
                    if ( primaryText == 'Module' ) {
                        mixedList = 'You have modules mixed in artifact selection';
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

                    setContainerText("statusContainer", `Found ${totalLinks} ${linkOrLinks} for ${totalArtifacts} ${artifactOrArtifacts} scanned. ${mixedList}`);
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
            const artifactFormat = jsonObject.data?.values["http://www.ibm.com/xmlns/rdm/types/ArtifactFormat"];
            
            // Check if it is of type "Module"
            if (format && format.endsWith("#Module") && artifactFormat === "Module" && browserURLtop.includes('showArtifactPage')) {
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
                // console.log('URI:', uri);
                // if artifact.uri isHeading value is not true and artifact's isStructureRoot is not true
                if (!artifact.isHeading && !artifact.isStructureRoot) {
                    // Create an ArtifactRef object sub function to enable await
                    const textArtifactRef = await createArtifactRef(artifact.uri, componentUri, moduleUri, 'Text');
                    artifactRef.push(textArtifactRef);
                    // console.log('Text Artifact Uri:', JSON.stringify(textArtifactRef.uri));
                } else if (artifact.isHeading) {
                    counts.totalArtifacts++; // Increment the total artifacts count for Headings
                }
            }
            // console.log('Text Artifact Array:', JSON.stringify(artifactRef)); 
            const resultCounts = await readAllLinks(artifactRef, moduleBinding);
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
    setContainerText("moduleStatusContainer", '');
    let counts = { totalLinks: 0, totalArtifacts: 0, totalModules: 0 };
    // Check that there are objects in the artifactRef
    if (widgetHandler.selArtRef === 0) { // When clicking the button get [] as artifactRef
        // console.log('Processing selected artifacts.');
        alert('No artifacts selected. Select Artifacts from Module or Project View.');
        return;
    } 
    // Read links of the array of selected artifacts
    const resultCounts = await readAllLinks(widgetHandler.selArtRef, []);
    counts.totalLinks += resultCounts.totalLinks;
    counts.totalArtifacts += resultCounts.totalArtifacts;
    updateStatusAndButtons(counts);
}

async function readAllModulesButtonOnClick() {
    let counts = { totalLinks: 0, totalArtifacts: 0, totalModules: 0 };

    // Check that we are in Module listing view
    if (!widgetHandler.selArtRef || widgetHandler.selArtRef.length === 0) { 
        setContainerText("statusContainer", 'No Modules selected. Select Modules in Module listing View.');
        return;
    }

    setContainerText("moduleStatusContainer", 'Processing Modules...');
    // toggleElementVisibility('stopRunContainer', 'block');
    // run = true;
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
    // if (totalLinks === 0) {
    //     setContainerText("statusContainer", 'No embedded Artifacts without Embeds Link found.');
    // }
    // Handle pluralization
    let linkOrLinks = 'links';
    if (totalLinks === 1) { linkOrLinks = 'link'; }
    setContainerText("statusContainer", `Created ${totalLinks} ${linkOrLinks}.`);
    setContainerText("moduleStatusContainer", '');
    toggleElementVisibility('reloadContainer', 'block');
    toggleElementVisibility('stopRunContainer', 'none');
    toggleElementVisibility('createLinksContainer', 'none');
}