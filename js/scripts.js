var rate = 0.25;
var scale = 0.25;

// after arrow gets clicked 
function boostRate(dir) {
    rate = rate + dir*rate*scale;
}
    
(function() {
    var mahname = "icon";
    var div = document.getElementById(mahname); 
    
    var scene = new THREE.Scene();
    var clock = new THREE.Clock();
    var targetRotationX = 0;
    var targetRotationOnMouseDownX = 0;
    var targetRotationY = 0;
    var targetRotationOnMouseDownY = 0;
    var mouseX = 1.2;
    var mouseXOnMouseDown = 0;
    var mouseY = 0.5;
    var mouseYOnMouseDown = 0;
    var mouse = false;
    
    var hoverState = 0;
    
    // group (you hid a plane in the scene prob should remove it)
    group = new THREE.Object3D();
    group.position.x = 0.0;
    group.position.y = 0.0;
    group.position.z = 0.0;
    group.rotation.x = Math.PI;
    
    
    // camera
    var camera = new THREE.PerspectiveCamera( 30, div.offsetWidth / div.offsetHeight, 1, 10000 );
    camera.position.y = 0;
    camera.position.z = 10;
    scene.add( camera );
    
    var light = new THREE.DirectionalLight( 0x404040 ); 
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );
    light.castShadow = true;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    
    var d = 300;
    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;
    light.shadowCameraFar = 1000;
    light.shadowDarkness = 0.5;
    scene.add( light );
    
    light = new THREE.DirectionalLight( 0x3dff0c, 0.35 );
    light.position.set( 0, -1, 0 );
    scene.add( light );
    
    // geos
    var plane = new THREE.Mesh(
                    new THREE.PlaneGeometry(4, 4, 20, 20), 
                    new THREE.MeshBasicMaterial({ color: 0x7f7f7f, wireframe: true })
    );
    plane.rotation.x = Math.PI;
    plane.position.set(0,0,-2);
    
    var geometry = new THREE.SphereGeometry(2,25,25);
    //var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
    
    // post proc
    var uniforms = {
        time: { type: "f", value: 1.0 },
        amp: { type: "f", value: 0.0 },
        mousex: { type: "f", value: mouseX },
        mousey: { type: "f", value: mouseY },
        resolution: { type: "v2", value: new THREE.Vector2() }
    };
    
    var attributes = {
        displacement: { type: "f", value: [] }
    };
    
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: document.getElementById( 'vertexShader' ).textContent, // i thought i stopped doing vert stuff?
        fragmentShader: document.getElementById( 'juliaSINE-fs' ).textContent // dat complex colouring
    });
    
    var sphere = new THREE.Mesh(geometry, material);
    //var sphere = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    var verts = sphere.geometry.vertices;
    var values = attributes.displacement.value;
    
    for (var v = 0; v < verts.length; v++) {
        values.push(Math.random() * 0.50);
    }
    
    var amp = 0;
    var time = 1.0;
    
    group.add(sphere);
    //group.add(plane);
    //scene.add(plane);
    scene.add(group);
    
    // sstrrrobe eeeffeectt (make this live outside of threejs scene soon)
    function domUpdater(amp, cls, bkg) {
    	var  fontElems = document.querySelectorAll(cls);
    	var red = Math.floor((Math.abs(1.0 - amp)*255))
    	var green = Math.floor(Math.abs(amp*amp - 0.75)*255);
    	var blue = Math.floor((amp*amp)*255)
    	var alpha = 0.1;
    	for (var i = 0; i < fontElems.length; i++) {
    		fontElems[i].style.color = "rgb(" + red + "," + green + "," + blue + ")";
    		if (bkg === true) {
    			fontElems[i].style.background = "rgba(" + red + "," 
    													+ green + "," 
    													+ blue + "," 
    													+ alpha + ")";
    			hoverState = 1;
    		}
    	}
    }
    
    // stops strobing in links when hovered? why was this an issue?
    function domCleaner(cls) {
    	if (hoverState == 0) {
    		return;
    	}
    	var  fontElems = document.querySelectorAll(cls);
    	for (var i = 0; i < fontElems.length; i++) {
    		fontElems[i].style.background = "";
    		fontElems[i].style.color = "";
    	}
    	
    	hoverState = 0;
    }
    
    // for the numbers 
    function domFiller(amp, cls) {
    	var  fontElems = document.querySelectorAll(cls);
    	for (var i = 0; i < fontElems.length; i++) {
    		fontElems[i].innerHTML = "" + amp; 
    	}
    }
    
    function dom_events() {
    
        var delta = clock.getDelta();
    
        time += delta*rate;     
        amp = Math.sin(time);
    
        // random dom changing
    	domCleaner("a");
    	domUpdater(amp, ".rainbow", false);
    	domUpdater(amp, "a:hover", true);
    	domUpdater(amp, "#block", true);
    	domUpdater(amp, "#currate", true);
    	domUpdater(amp, "#larrow", false);
    	domUpdater(amp, "#rarrow", false);
    	domFiller(amp, "#currate");

        return delta;
    }
    
    // click events
    function onDocumentMouseDown( event ) {
    
        //event.preventDefault();
    
        // start listening, add all the events we care about
        // mouse move = change orb rot speed
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        // up or out means when should stop spinning AND stop listening 
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    
    
        // start it out
        mouseXOnMouseDown = event.clientX - window.innerWidth/2;
        mouseYOnMouseDown = event.clientY - window.innerHeight/2;
    
        targetRotationOnMouseDownX = targetRotationX;
        targetRotationOnMouseDownY = targetRotationY;
    };
    
    function onDocumentMouseMove( event ) {
    
        // speed calcs found on web
    	mouseX = event.clientX - window.innerWidth/2;
    	mouseY = event.clientY - window.innerHeight/2;
        mouse = true;
    
    
    	targetRotationX = targetRotationOnMouseDownX + ( mouseX - mouseXOnMouseDown ) * 0.20;
    	targetRotationY = targetRotationOnMouseDownY + ( mouseY - mouseYOnMouseDown ) * 0.20;
    };
    
    // add remove event listeners on the fly
    function onDocumentMouseUp( event ) {
    
    	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    };
    
    function onDocumentMouseOut( event ) {
    
    //	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    //	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    //	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    };
    
    
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    
    function createRenderer() {
        // rendererererer define loc/size/transp
        var renderer = new THREE.WebGLRenderer( { alpha: true });
        renderer.setSize(div.offsetWidth, div.offsetHeight);
        renderer.setClearColor( 0x000000, 0 );
        div.appendChild(renderer.domElement);
        
        // found on web, hanldes reprojection of scene
        function onWindowResize( event ) {
            window.addEventListener( 'resize', onWindowResize, false );
            uniforms.resolution.value.x = div.offsetWidth;
            uniforms.resolution.value.y = div.offsetHeight;
            camera.aspect = div.offsetWidth / div.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( div.offsetWidth, div.offsetHeight );
        }
        
        function render() {
            // sleep when not viewed
            requestAnimationFrame(render);
            
            // clock does weird shit when asked for delta twice
            var delta = dom_events();
            uniforms.time.value += delta*rate;     
            uniforms.amp.value = Math.sin(uniforms.time.value);     
            if (mouse) {
                uniforms.mousex.value = (mouseX/(window.innerWidth/2))*9.42*0.5;
                uniforms.mousey.value = (mouseY/(window.innerHeight/2))*9.42*0.5;
                mouse = false;
            }
        
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.02;
            sphere.rotation.z += 0.03;
        
        //    group.rotation.y += ( targetRotationX - group.rotation.y ) * 0.05;
        //    group.rotation.x += ( targetRotationY - group.rotation.x ) * 0.05;
        //
        
            renderer.render(scene, camera);
        }

        // gotta call it here
        self.windowResize = onWindowResize;
        self.render = render;
        return self;
    }

    try {

         var Renderer = createRenderer();
         Renderer.windowResize();
         Renderer.render();

    } catch(err) {
        // cant create 3D scene soo ..
        function noGLRender() {
            requestAnimationFrame(noGLRender);
            dom_events()
        };

        noGLRender();

        //TODO" insert image of sphere as placeholder?
        //TODO: prob should do it in the html for those non-js guys
    }


})()
