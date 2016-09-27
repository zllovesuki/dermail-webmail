var self = module.exports = {

	arrayUnion: function(arr1, arr2, equalityFunc) {
	    var union = arr1.concat(arr2);

	    for (var i = 0; i < union.length; i++) {
	        for (var j = i+1; j < union.length; j++) {
	            if (equalityFunc(union[i], union[j])) {
	                union.splice(j, 1);
	                j--;
	            }
	        }
	    }

	    return union;
	}, // http://stackoverflow.com/questions/13319150/union-of-array-of-objects-in-javascript

	listToTree: function(data, options) {
		options = options || {};
		var ID_KEY = options.idKey || 'id';
		var PARENT_KEY = options.parentKey || 'parent';
		var CHILDREN_KEY = options.childrenKey || 'children';

		var tree = [],
			childrenOf = {};
		var item, id, parentId;

		for (var i = 0, length = data.length; i < length; i++) {
			item = data[i];
			id = item[ID_KEY];
			parentId = item[PARENT_KEY] || 0;
			// every item may have children
			childrenOf[id] = childrenOf[id] || [];
			// init its children
			item[CHILDREN_KEY] = childrenOf[id];
			if (parentId != 0) {
				// init its parent's children object
				childrenOf[parentId] = childrenOf[parentId] || [];
				// push it into its parent's children object
				childrenOf[parentId].push(item);
			} else {
				tree.push(item);
			}
		};

		return tree;
	},

	getHeader: function(state) {
		return {
			headers: {
				'Authorization': 'JWT ' + state.token
			}
		}
	},

	_http: function($http, state, action, endpoint, header, data) {
		header = !!header ? self.getHeader(state): {};
		data = data || {};
		var handle;
		if (action === 'get') handle = $http[action](endpoint, header)
		else handle = $http[action](endpoint, data, header)
		return handle
		.then(function(res) {
			return res;
		})
		.catch(function(res) {
            return res.json().then(function(data) {
                if (data.hasOwnProperty('message')) {
    				state.alert.error(data.message);
    			}else{
    				state.alert.error(res.statusText);
    			}
            })
		})
	},

	getWithHeader: function($http, state, endpoint) {
		return self._http($http, state, 'get', endpoint, true)
	},

	postWithHeader: function($http, state, endpoint, data) {
		return self._http($http, state, 'post', endpoint, true, data)
	},

	postWithoutHeader: function($http, state, endpoint, data) {
		return self._http($http, state, 'post', endpoint, false, data)
	}
}
