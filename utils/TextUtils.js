function isNullOrUndefinedOrEmpty(value) {
    if (value == undefined || value == null || value == "") {
        return true
    }
    return false
}

module.exports = {
    isNullOrEmpty: (value) => {
        if (value == null || value == "") {
            return true
        }
        return false
    },

    isNullOrUndefinedOrEmpty: isNullOrUndefinedOrEmpty,

    splitWords: (value, key) => {
        return isNullOrUndefinedOrEmpty(value) ? [] : value.split(key)
    },

    isZeroOrNegative: (value) => {
        if (value <= 0) {
            return true;
        }
        return false;
    },

    capitalizeEachWord: (str) => {
        return str
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
}