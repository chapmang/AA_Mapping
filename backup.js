
SearchView = function(model, elements){

	this._model = model;
	this._elements = elements;

	this.searchButtonClicked = new Event(this);
	this.locationSelectionClicked = new Event(this);

	var _this = this;

	this._elements.searchButton.addEventListener('click', function(e) {
		e.preventDefault();
		_this.searchButtonClicked.notify();
	});

	this._model.searchResponse.attach(function(){
		_this.displayResults();
	});
};

SearchView.prototype.displayResults = function() {
	
	var results,
		singleResult;

	results = this._model.getSearchResults();
	
	document.getElementById("searchResults").innerHTML = results;
};

SearchController = function(model, view) {
	
	this._model = model;
	this._view = view;

	var _this = this;

	this._view.searchButtonClicked.attach(function(){
		_this.search();
	});
};

SearchController.prototype.search = function(){

	var searchString = document.getElementById("search-query").value;
	if (searchString) {
		this._model.nameSearch(searchString);
	}
};

LayerModel = function(){
	
	var layers;
	this.getLayers = function(){
		layers = Map.getLayers().getArray();
		return layers;
	};
};

LayerView = function(model, elements) {

	this._model = model;
	this._elements = elements;

	this.layerNameClicked = new Event(this);

	var _this = this;
	
	this._elements.layerSwitcher.addEventListener('click', function(e) {

		e = e || event;
		var target = e.srcElement || e.target,

			isRow = function(el) {
				return el.tagName.match(/tr/i);
			};
		while (target = target.parentNode) {
			if (isRow(target)) {
				_this.layerNameClicked.notify({
					target: target,
					layername: target.dataset.title
				});
				return true;
			}
		}
		
	});
};

LayerView.prototype.loadLayers = function(){

	var layers = this._model.getLayers();
	for (var i = 0 ; i < layers.length; i++) {
		var title = layers[i].get('title');
		if ( title === undefined) { continue; }
		var visibility = layers[i].get('visible');
		if (visibility === true) {
			var status = 'eye-open';
		} else {
			var status = 'eye-close';
		}
		var legend = title.replace(/\s+/g, '');
		document.getElementById("layerSwitcher").innerHTML += "<tr class='layerName' data-title='"+title+"'><td><span class='glyphicon glyphicon-"+status+"' aria-hidden='true'></span></td><td>"+title+"</td>"+
			"</tr>";
	}

};

LayerView.prototype.switchLayer = function(args) {

	var layer = this._model.findBy(Map.getLayerGroup(), 'title', args.layername);
	var visibility = !layer.getVisible();
    layer.setVisible(!layer.getVisible());
    if (visibility) {
			console.log(args.target.innerHTML);
            $(this).find('span').removeClass('glyphicon-eye-close')
                .addClass('glyphicon-eye-open');
        } else {
            // Else the layer is not visible.
            $(this).find('span').removeClass('glyphicon-eye-open')
                .addClass('glyphicon-eye-close');
        }
};

LayerModel.prototype.findBy = function(layer, key, value) {

	    if (layer.get(key) === value) {
        return layer;
    }

    // Find recursively if it is a group
    if (layer.getLayers) {
        var layers = layer.getLayers().getArray(),
            len = layers.length,
            result;
        for (var i = 0; i < len; i++) {
            result = this.findBy(layers[i], key, value);
            if (result) {
                return result;
            }
        }
    }

    return null;
};

LayerController = function(model, view) {
	
	this._model = model;
	this._view = view;

	var _this = this;

	this._view.layerNameClicked.attach(function(sender,args){
		_this._view.switchLayer(args);
	});
};