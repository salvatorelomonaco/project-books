// chiamata ajax generale leggendo il valore della query
$(document).ready(function() {

    var template = $('#template').html();
    var templateFunction = Handlebars.compile(template);

    var templateBottom = $('#templateBottom').html();
    var templateBottomFunction = Handlebars.compile(templateBottom);

    $('#search_icon').click(function () {
        $('#searchbar').animate({width:'toggle'},350);
        // $('.top.section').empty();
        // $('.bottom.section').empty();
        // var ricerca = $('input').val();
        // bookApiCall(ricerca);
    });

    $('input').keypress(function (event) {
        if (event.which == 13) {
            $('.intro').hide();
            $('.arrow i').show();
            $('.top.section').empty();
            $('.bottom.section').empty();
            var ricerca = $('input').val();
            bookApiCall(ricerca);
        }
    });

    //carosello:
    //aggiungiamo classe show all'u;ltimo libro
    //intercettiamo click su freccia
    $('.arrow.right i').click(function(){
        $('.top.section').append($('.book-card').eq(0));
        var infoCorrente = $('.info-container.active');
        var infoSucc = infoCorrente.next();
        infoCorrente.removeClass('active');
        infoSucc.addClass('active');
        $('.bottom.section').append($('.info-container').eq(0));
    });

    $('.arrow.left i').click(function(){
        // BISOGNA USCIRE DAI 39 FISSI!!!!
        $('.top.section').prepend($('.book-card').eq(39));
        $('.bottom.section').prepend($('.info-container').eq(39));
        var infoCorrente = $('.info-container.active');
        var infoPrev = infoCorrente.prev();
        infoCorrente.removeClass('active');
        infoPrev.addClass('active');
    });

    function bookApiCall(ricercaUtente) {
        $.ajax({
            'url': 'https://www.googleapis.com/books/v1/volumes?q=' + ricercaUtente,
            'method': 'GET',
            'data':{
                'key':'AIzaSyAGHLZ08VPW8NW1rwJELaYO1vnBLThiyKE',
                'maxResults': 40
            },
            'success': function(data) {
                // cicliamo il data .items che ci restituisce un libro ad ogni ciclio
                console.log(data);
                var books = data.items;
                bookGenerator(books);
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
                    var currentBook = data.volumeInfo;
                    if (currentBook.authors) {
                        var str =  currentBook.authors.join(' ');
                    } else {
                        var str = 'author not avaible';
                    }
                    if (!currentBook.averageRating) {
                        var vote = 0;
                    } else {
                        var vote = Math.floor(currentBook.averageRating);
                    }
                    var fullStar = '<i class="fas fa-star"></i>';
                    var emptyStar = '<i class="far fa-star"></i>';
                    var container = $('.bottom.section');
                    var classActive = '';
                    // qui mettiamo il codice per regolare le classi active
                    if ((container).is(':empty')) {
                        var classActive = 'active';
                    }
                    var propertiesBottom = {
                        'title': currentBook.title,
                        'author': str,
                        'publishedDate': currentBook.publishedDate.slice(0, 4),
                        'rating': fullStar.repeat(vote),
                        'noRating': emptyStar.repeat(5 - vote),
                        'description': currentBook.description,
                        'publisher': currentBook.publisher,
                        'pageCount':  currentBook.pageCount,
                        'categories': currentBook.categories,
                        'class': classActive
                    }
                    var properties = {
                        'img':  currentBook.imageLinks.thumbnail
                    };
                    var topSection = templateFunction(properties);
                    var bottomSection = templateBottomFunction(propertiesBottom);
                    $('.top.section').append(topSection);
                    $('.bottom.section').append(bottomSection);
                },
                'error': function() {
                }
            })
        }
    };
});

$(document).on('click', '.book-card', function() {
    $('.info-container').removeClass('active');
    $('.book-card').removeClass('opacity');
    $(this).addClass('opacity');
    var that = $(this);
    var current = $('.top.section').find(that).index();
    $('.bottom.section').find('.info-container').eq(current).addClass('active');
})
