function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

// calculate the distance between previous and new moved marker
function Haversine(_prevLatLng, _newLatLng) {
  const R = 6371e3, // metres
    φ1 = degToRad(_prevLatLng.lat),
    φ2 = degToRad(_newLatLng.lat),
    Δφ = degToRad(_newLatLng.lat - _prevLatLng.lat),
    Δλ = degToRad(_newLatLng.lng - _prevLatLng.lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.abs((d = R * c));
}

module.exports = Haversine;
