export const FORMATS = {
  Football: [
    { label: '5v5', players: 10 },
    { label: '6v6', players: 12 },
    { label: '7v7', players: 14 },
  ],
  Padel: [
    { label: '2v2', players: 4 },
  ],
  Basketball: [
    { label: '3v3', players: 6 },
    { label: '5v5', players: 10 },
  ],
  Volleyball: [
    { label: '6v6', players: 12 },
  ],
  Tennis: [
    { label: 'Singles', players: 2 },
    { label: 'Doubles', players: 4 },
  ],
};

// Sample venues with fixed prices

export const VENUES = [
  { id: 1, name: 'Al Waha Pitch', area: 'Al Malqa', sport: 'Football', price: 400 },
  { id: 2, name: 'Riyadh Front Pitch', area: 'Al Yasmin', sport: 'Football', price: 450 },
  { id: 3, name: 'Hittin Arena', area: 'Hittin', sport: 'Football', price: 600 },
  { id: 4, name: 'Smash Club', area: 'Al Olaya', sport: 'Padel', price: 200 },
  { id: 5, name: 'Elite Club', area: 'Hittin', sport: 'Padel', price: 240 },
  { id: 6, name: 'Court 9', area: 'Al Nakheel', sport: 'Basketball', price: 150 },
  { id: 7, name: 'Sports Hall', area: 'Al Yasmin', sport: 'Volleyball', price: 180 },
  { id: 8, name: 'Diplomatic Quarter Courts', area: 'Diplomatic Quarter', sport: 'Tennis', price: 120 },
];