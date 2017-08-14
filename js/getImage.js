function transition() {
	/* clear any messages being displayed */
	$( '#message' ).html( '' );
	let t = [
		'Retrieving borks...',
		'Consulting dog therapy clinic...',
		'Boofs are imminent.',
		'They\'re good dogs, Brent.',
	]

	let render = randRange( 0, t.length, false );
		$( '#controls' ).fadeOut( 150, () => {
			$( '#target' ).fadeOut( 150, () => {
				$( '#title' ).slideDown( () => {
					$	( '#loadingMessage' ).hide().html( t[render] ).fadeIn( 150, () => {
						getImage();
					} );
				} );
			} );
		} );

}

function randRange( min, max, incl = true ) {
  /* Returns a random integer between min and max.
   * incl denotes whether max is included in this range; default is true.
   */
  max = incl ? max + 1 : max;
  return Math.floor( Math.random ( max - min + 1 ) * max );
}

function getSearchParams( tags ) {
	/* generates random search parameters always including an element in tags
	 * one or many elements in mods may be appended to the search
	 */
	var tag = randRange( 0, tags.length );
  var mods = [ 'cute', 'funny', 'corgis', 'pugs', 'doggos', 'puppers', ]

  var params = [ tags[tag], ];
  mods.forEach( e => {
    if( randRange( 0, 1 ) ) {
      params.push( '+'.concat( e ) );
    }
  } );

  return params.join( '' ) ;
}

function curate( gif, tags, i ) {
	/* searches the tags and title of a random image contained in JSON response
	 * and returns an object indicating pass/fail, and  index of the image tested
	 * an image passes if either tags or title conains an element in .tags
	 *
	 * ISSUES:
	 * RegExp.ignoreCase doesn't seem to work properly.
	 * haven't figured out why; can bypass by forcing lowercase on String.match()
	 */
	var pass = false;

	/* search tags first */
	if( gif[i].tags ) {
		pass = tags.some( ele => {
			let re = new RegExp( ele, 'im' );
			return gif[i].tags.join().toLowerCase().match( ele );
		} );
	}

	/* only search title if nothing was found in tags */
	if( gif[i].title && !pass ) {
		pass = tags.some( ele => {
			let re = new RegExp( ele, 'im' );
			return gif[i].title.toLowerCase().match( ele );
		} );
	}

	return { 'pass': pass, 'index': i };
}

function getImage() {
	/* sends a request to Gfycat API endpoint
	 * curates response for images with tag/title containing "dog" or something
	 * image is always randomly selected
	 * displays image and handles page transitions once loaded
	 */
	var tags = [ 'dog', 'dogs', 'puppy', 'puppies' ]; // initial search tags
  var mods = getSearchParams( tags ); // search modifiers
	var url = 'https://api.gfycat.com/v1test/gfycats/search?search_text=' + mods + '&count=100';

	$.ajax( {
	  dataType: "json",
	  url: url,
		timeout: 2000
	} )
		.done( data => {
			var c = { 'pass': false, 'index': null }; // to be mutated by curate()
			var blacklist = []; // images that don't pass curate() pushed to blacklist
			var i; // index of image being passed to curate()

			try {
				while( !c.pass ) {
					let calls = 0;
					while( true ) {
						/* stop execution if loop runs through all images in search */
						calls++;
						if( calls > 100 ) { throw 'NO MATCHES'; }

						/* get a random image from search, exit if it's unique */
						i = randRange( 0, data.gfycats.length, false );
						if( !blacklist.includes( i ) ) { break; }
					}

					c = curate( data.gfycats, tags, i );
					if( !c.pass ) { blacklist.push( c.index ); }

				}
			}
			catch( e ) {
				/* client-side timeout error */
				$( '#controls' ).fadeIn( 150 );
				$( '#message' ).html( 'Couldn\'t find any puppers in this search! Try again? (ERR: ' + e + ')'  );
			}

			var gif = data.gfycats[c.index]; // image to be rendered

			/* If image is greater than 5:4 aspect ratio
			 * make media height-responsive. Otherwise, width-responsive.
			 */
			var a = ( gif.height >= .8*gif.width ) ? 'max-height' : 'width';
			var b = ( gif.height < .8*gif.width ) ? 'max-width' : 'height';
			$( '#target ').css( a, 'inherit' );
			$( '#target' ).css( b, 'auto' );

			/* render image and control panel */
			$( '#target' ).attr( 'src', gif.mp4Url );
			$( '#controls' ).css( 'width', $( '#target' ).css( 'width' ) + 'px' );

			/* render image additional info */
			$( '#mp4Text' ).attr( 'value', gif.mp4Url );
			$( '#mobileText' ).attr( 'value', gif.mobileUrl );
			$( '#gifText' ).attr( 'value', gif.gifUrl );
			$( '#webmText' ).attr( 'value', gif.webmUrl );

			/* update twitter link */
			$( '#tweet' ).attr(
				 'href',
				 'https://twitter.com/intent/tweet?hashtags=InternetTherapyDog&related=freecodecamp&text=' + gif.mobileUrl
			 );

			 /* page transitions */
			$( '#loadingMessage' ).fadeOut( 150, () => {
				$( '#title' ).slideUp( () => {
					$( '#target' ).show( () => {
						$( '#controls' ).slideDown();
					} );
				} );
			} );
		} )

    .fail( data => {
			/* server-side error */
			$( '#controls' ).fadeIn( 150 );
			$( '#message' ).html( 'Whoops! Looks like the doggo server had a hiccup.' );
		} );
}
