var $card = $('.card'),
	$buyLink = $('.product__buy-link'),
	$disabled = 'disabled',
	$defaultHover = 'default-hover',
	$selected = 'selected',
	$selectedHover = 'selected-hover';

// Состояние наведения
$card.hover(

	function(e) {

		var $product = $(this).parents('.product__item');

		if ($product.hasClass($disabled) === false) {

			if ($product.hasClass($selected) === false) {
				$product.addClass($defaultHover);
			} else {
				$product.addClass($selectedHover);			
			}

			e.preventDefault();
			
		}

	},

	function(e) {

		var $product = $(this).parents('.product__item');

		if ($product.hasClass($defaultHover)) {
			$product.removeClass($defaultHover);
		} else if ($product.hasClass($selectedHover)) {
			$product.removeClass($selectedHover);
		}

		e.preventDefault();

	}

);

// Функция выбораба продукта при клике
$.fn.selectProduct = function() {

	this.on('click', function(e) {

		var $product = $(this).parents('.product__item');

		if ($product.hasClass($disabled) === false) {

			$product.toggleClass($selected);
			$product.removeClass($defaultHover);
			$product.removeClass($selectedHover);
			e.preventDefault();

		}

	});

};


$card.selectProduct();

$buyLink.selectProduct();