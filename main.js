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
            $('#selector').addClass('active');
        }
    });

    // $('.book-card:first-child').addClass('opacity');

    $('#selector').change(function(){
        var current_value = $(this).val();
        $('.empty').removeClass('active');
        $('.arrow i').show();
        // caso in cui si voglia tornare a visualizzare tutti i libri tramite 'Seleziona genere'
        if (current_value == '') {
            // azzera tutto e
            $('.book-card').removeClass('hide');
            $('.book-card').removeClass('boom');
            $('.book-card').removeClass('opacity');
            // al primo libro dai opacity
            $('.book-card:first-child').addClass('opacity');
            $('.info-container').removeClass('active');
            // al primo info dai active
            $('.info-container:first-child').addClass('active');
        } else {
            // entro dentro un genere specifico e inizio a sfogliare OGNI libro
            $('.book-card').each(function(){
                var info_value = $(this).attr('data-generi');
                // se trovo una corrispondenza
                if (info_value.toLowerCase().includes(current_value.toLowerCase())) {
                    // a questo libro do la classe boom e rimuovo hide
                    $(this).removeClass('hide').addClass('boom');
                } else {
                    // altrimenti, lo nasconodo con hide e rimuovo opacity
                    $(this).addClass('hide').removeClass('boom');
                    $(this).removeClass('opacity');
                };
            });
            // a questo punto, ho una nuova lista di libri filtrati, etichettati con boom e hide

            // se non esistono libri con classe boom (non sono state trovate corrispondenze)
            if (!$('.book-card').hasClass('boom')) {
                // QUI POSSIAMO GESTIRE MESSAGGIO DI NON CORRISPONDENZA E FRECCE CAROSELLO
                $('.arrow i').hide();
                $('.empty').addClass('active');
                //rimuovo la classe active a tutti gli info
                $('.info-container').removeClass('active');
            } else {
                // invece, se esiste almeno un libro con la classe boom, quindi almeno un libro riesce a soddisfare il filtro
                // faccio pulizia totoale di opacity e active
                $('.book-card').removeClass('opacity');
                $('.info-container').removeClass('active');
                // al primo libro con boom do opacity
                var first_filtred_book = $('.book-card.boom').first();
                first_filtred_book.addClass('opacity');
                // all'info, nella stessa posizione, do la classe active
                var position = first_filtred_book.index();
                $('.info-container').eq(position).addClass('active');
            }
        };
    });


    //carosello:
    //aggiungiamo classe show all'u;ltimo libro
    //intercettiamo click su freccia
    $('.arrow.right i').click(function(){
        // al click sulla freccia, se c'è un boom fai delle cose particolari
        // quali? scorri vero il prossimo book boom
        if ($('.book-card').hasClass('boom')) {
            var bookCorrente = $('.book-card.opacity');
            
            bookCorrente.removeClass('opacity');
            bookSucc.addClass('opacity');
        } else {
            // altrimenti comportati di default
            var bookCorrente = $('.book-card.opacity');
            var bookSucc = bookCorrente.next();
            bookCorrente.removeClass('opacity');
            bookSucc.addClass('opacity');
            $('.top.section').append($('.book-card').eq(0));
            var infoCorrente = $('.info-container.active');
            var infoSucc = infoCorrente.next();
            infoCorrente.removeClass('active');
            infoSucc.addClass('active');
            $('.bottom.section').append($('.info-container').eq(0));
        }
    });

    $('.arrow.left i').click(function(){
        // al click sulla freccia, se c'è un boom fai delle cose particolari
        // quali? scorri vero il prossimo book boom
        // altrimenti comportati di default
        $('.top.section').prepend($('.book-card').eq(9));
        $('.bottom.section').prepend($('.info-container').eq(9));
        var bookCorrente = $('.book-card.opacity');
        var bookSucc = bookCorrente.prev();
        bookCorrente.removeClass('opacity');
        bookSucc.addClass('opacity');
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
                'maxResults': 10
            },
            'success': function(data) {
                // cicliamo il data .items che ci restituisce un libro ad ogni ciclio
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
                        'class': classActive,
                        'categories': currentBook.categories
                    }
                    var properties = {
                        'categories': currentBook.categories,
                        'img':  currentBook.imageLinks.thumbnail
                    };
                    var topSection = templateFunction(properties);
                    var bottomSection = templateBottomFunction(propertiesBottom);
                    $('.top.section').append(topSection);
                    $('.bottom.section').append(bottomSection);
                    $('.book-card:first-child').addClass('opacity');
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
