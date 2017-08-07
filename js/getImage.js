

function dequote( link ) {
	return JSON.stringify( link ).replace( /["']/gi, '' );
}

function getSearchParams() {
	let tags = [ 'dog', 'dogs', 'puppy', 'puppies' ];
	let tag =  Math.floor( Math.random( tags.length  + 1 ) * tags.length );
  let mods = [ 'cute', 'funny', ]

  let params = [ tags[tag], ];
  mods.forEach( e => {
    if( Math.floor( Math.random( 2 ) * 2 ) ) {
      params.push( '+'.concat( e ) );
    }
  } );

  // DEBUG
  $( '#debug p' ).html( 'Requested search params: ' + params.join( '' ) );
  return params.join( '' ) ;
}

function getImage() {
  var mods = getSearchParams();
  let load = new Promise(
    ( resolve, reject ) => {
      $.getJSON( 'https://api.gfycat.com/v1test/gfycats/search?search_text=' + mods + '&count=100', data => {
        // render random image
        let i = Math.floor( Math.random ( data.gfycats.length + 1 ) * data.gfycats.length );
        let gif = data.gfycats[i];

        // render image and show link
        $( '#gif' ).html( '<img src=' + JSON.stringify( gif.max5mbGif )	+ '>'	);
        $( '#desc' ).html( 'Link: ' + dequote( gif.gifUrl ) );

        // resolve when everything is loaded
        resolve( data );
      } );
    }
  )

	load.then(
    data => {
      // fade in after everything is done
      $( '#gif' ).fadeIn( 300 );
    }
  );

  load.catch(
    reason => {
      $( '#gif' ).fadeIn( 300 );
      $( '#gif' ).html( 'Whoops! There was a problem loading this image.' );
    }
  );
}
