window.onload = () => {
	// load an image on landing
	$( '#loading' ).fadeOut( 300, () => {
		getImage();
	} );

	// add click listener to "new image" button
	document.querySelector( '#refreshImg' ).addEventListener( 'click', () => {

		// clear error message if any
		$( '.message' ).html( '' );

		// fade out video and buttons
		$( '#controls' ).fadeOut( 150, () => {
			$( '#target' ).fadeOut( 150, () => {
				// get loading message
				let t = [
					'Retrieving borks...',
					'Consulting dog therapy clinic...',
					'Boofs are imminent.',
					'They\'re good dogs, Brent.',
				]
				let render = randRange( 0, t.length );
				$( '#loading h2' ).html( t[render] );

				// fade in loading message, then make API request
				$( '#loading' ).fadeIn( 150, () => {
					getImage();
				} );
			} );
		} );
	} );
};

function randRange( min, max, incl = true ) {
  /* Returns a random integer between min and max.
   * incl denotes whether max is included in this range; default is true.
   */
  max = incl ? max + 1 : max;
  return Math.floor( Math.random ( max - min + 1 ) * max );
}

function dequote( link ) {
	return JSON.stringify( link ).replace( /["']/gi, '' );
}

function getSearchParams( tags ) {
	/* generates random search parameters always including an element in tags
	 * one or many elements in mods may be appended to the search
	 */
	let tag = randRange( 0, tags.length );
  let mods = [ 'cute', 'funny', ]

  let params = [ tags[tag], ];
  mods.forEach( e => {
    if( randRange( 0, 1 ) ) {
      params.push( '+'.concat( e ) );
    }
  } );

  return params.join( '' ) ;
}

function getImage() {
	let tags = [ 'dog', 'dogs', 'puppy', 'puppies' ];
  let mods = getSearchParams( tags );
	let url = 'https://api.gfycat.com/v1test/gfycats/search?search_text=' + mods + '&count=100';

	$.ajax( {
	  dataType: "json",
	  url: url,
		timeout: 2000
	} )
		.done( data => {
			// render random image
			let i = randRange( 0, data.gfycats.length, false );
			let pass = false;
			let gif = data.gfycats[i];
			console.log( 'TITLE: ' + gif.title );
			console.log( 'TAGS: ' + gif.tags );

			if( gif.tags ) {
				console.log( 'processing tags' );
				pass = tags.some( ele => {
					let re = new RegExp( ele, 'gi' );
					console.log( gif.tags.join( ' ' ).match( ele ) );
					return gif.tags.join( ' ' ).match( ele );
				} );
				console.log( 'IN TAGS... pass = ' + pass );
			}

			if( gif.title && !pass ) {
				console.log( 'processing title' );
				pass = tags.some( ele => {
					let re = new RegExp( ele, 'gi' );
					console.log( gif.title.match( ele ) );
					return gif.title.match( ele );
				} );
				console.log( 'IN TITLE... pass = ' + pass );
			}

			if( pass ) {
				// render image and show link
				// $( '#target' ).html( '<img src=' + JSON.stringify( gif.max5mbGif )	+ '>'	);
				$( '#target' ).attr( 'src', gif.mp4Url );
				$( '#target' ).attr( 'width', gif.width );
				$( '#target' ).attr( 'height', gif.height );
				$( '#controls' ).css( 'width', gif.width + 'px' );

				// DEBUG
				$( '#debug p' ).html( gif.width + 'x' + gif.height );
				$( '#mp4Text' ).attr( 'value', gif.mp4Url );

				// update twitter link
				$( '#tweet' ).attr(
					 'href',
					 'https://twitter.com/intent/tweet?hashtags=InternetTherapyDog&related=freecodecamp&text=' + gif.mobileUrl
				 );

				 $( 'html, body' ).animate( {
				 		scrollTop: $( '#media' ).offset().top
				 }, 500, 'easeInCubic' );

				 // fade in after everything is done
				 $( '#controls' ).fadeIn( 150 );
				 $( '#target' ).fadeIn( 150 );
				 $( '#loading' ).fadeOut( 150 );
				 console.log( 'rendering finished' );
			}

			else {
				console.log( 'Failed curator test. Recursing...' );
				getImage();
			}
		} )

    .fail( data => {
			$( '#controls' ).fadeIn( 150 );
			$( '.message' ).html( 'Whoops! There was a problem loading this image.' + '(' + ')' );
		} );
}
