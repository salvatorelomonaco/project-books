// chiamata ajax generale leggendo il valore della query
$(document).ready(function() {

    var template = $('#template').html();
    var templateFunction = Handlebars.compile(template);

    $('button').click(function () {
        $('.book-container').empty();
        var ricerca = $('input').val();
        bookApiCall(ricerca);
    })

    $('input').keypress(function (event) {
        if (event.which == 13) {
            $('.book-container').empty();
            var ricerca = $('input').val();
            bookApiCall(ricerca);
        }
    })

    function bookApiCall(ricercaUtente) {
        $.ajax({
            'url': 'https://www.googleapis.com/books/v1/volumes?q=' + ricercaUtente,
            'method': 'GET',
            'data':{
                'key':'AIzaSyAGHLZ08VPW8NW1rwJELaYO1vnBLThiyKE'
            },
            'success': function(data) {
                // cicliamo il data .items che ci restituisce un libro ad ogni ciclio
                var books = data.items;
                bookGenerator(books)
            },
            'error': function() {
            }
        })
    }

    function bookGenerator(object) {
        for (var i = 0; i < object.length; i++) {
            // di questo libro ci serve il .selflink
            var linkCredits = object[i].selfLink;
            // parte la seconda chiamata perche .selflink restituisce un oggetto con i crediti al suo interno
            $.ajax({
                'url': linkCredits,
                'method': 'GET',
                'data':{
                    'key':'AIzaSyAGHLZ08VPW8NW1rwJELaYO1vnBLThiyKE'
                },
                'success': function(data) {
                    // siamo dentro i credits del singolo libro
                    var currentBook = data.volumeInfo;
                    if (currentBook.authors) {
                        var str =  currentBook.authors.join(' ');
                    } else {
                        var str = 'author not avaible';
                    }
                    var properties = {
                        'img':  currentBook.imageLinks.thumbnail,
                        'title': currentBook.title,
                        'author': str,
                        'publishedDate': currentBook.publishedDate,
                        'rating': currentBook.averageRating,
                        'description': currentBook.description,
                        'publisher': currentBook.publisher,
                        'pageCount':  currentBook.pageCount,
                        'categories': currentBook.categories
                    }
                    var html = templateFunction(properties);
                    $('.book-container').append(html);
                },
                'error': function() {
                }
            })
        }
    };
});
//
