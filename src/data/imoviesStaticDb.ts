import { Movie, Theatre, Show, SeatItem, Promotion, User } from '../types/index.js';

export const STATIC_MOVIES: Movie[] = [
  {
    _id: 'mov_kalki_2898_ad',
    title: 'Kalki 2898 AD',
    slug: 'kalki-2898-ad',
    description: 'Set in a post-apocalyptic world in the year 2898 AD, a select few embark on a perilous mission to protect laboratory subject SUM-80 and her unborn child, believed to be the tenth avatar of Vishnu, Kalki. Starring Prabhas as Bhairava and Amitabh Bachchan as Ashwatthama.',
    genre: ['Sci-Fi', 'Action', 'Mythological'],
    language: 'Telugu / Hindi',
    durationMinutes: 181,
    releaseDate: '2024-06-27',
    contentRating: 'UA',
    posterUrl: '/assets/posters/kalki_2898_ad.jpg',
    backdropUrl: '/assets/posters/kalki_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone', 'Disha Patani'],
    status: 'now_showing',
    createdAt: '2024-06-27T00:00:00.000Z',
  },
  {
    _id: 'mov_stree_2',
    title: 'Stree 2: Sarkate Ka Aatank',
    slug: 'stree-2',
    description: 'After the events of Stree, the town of Chanderi is haunted by a new menace known as Sarkata who abducts progressive women. Vicky and his loyal gang must team up with the mysterious protector spirit to defeat the malevolent entity.',
    genre: ['Comedy', 'Horror'],
    language: 'Hindi',
    durationMinutes: 147,
    releaseDate: '2024-08-15',
    contentRating: 'UA',
    posterUrl: '/assets/posters/stree_2.jpg',
    backdropUrl: '/assets/posters/stree_2_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=KVnheQ84kCA',
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee', 'Aparshakti Khurana'],
    status: 'now_showing',
    createdAt: '2024-08-15T00:00:00.000Z',
  },
  {
    _id: 'mov_jawan',
    title: 'Jawan',
    slug: 'jawan',
    description: 'A high-octane emotional action thriller that outlines the journey of a man driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago. A massive box-office spectacle directed by Atlee.',
    genre: ['Action', 'Thriller', 'Drama'],
    language: 'Hindi',
    durationMinutes: 169,
    releaseDate: '2023-09-07',
    contentRating: 'UA',
    posterUrl: '/assets/posters/jawan.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
    cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone', 'Sanya Malhotra'],
    status: 'now_showing',
    createdAt: '2023-09-07T00:00:00.000Z',
  },
  {
    _id: 'mov_animal',
    title: 'Animal',
    slug: 'animal',
    description: 'A ferocious, complex drama exploring the volatile relationship between a son and his emotionally aloof industrialist father that erupts into ruthless underworld violence when an assassination attempt threatens his father.',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'Hindi',
    durationMinutes: 201,
    releaseDate: '2023-12-01',
    contentRating: 'A',
    posterUrl: '/assets/posters/animal.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Dydmpfo68DA',
    cast: ['Ranbir Kapoor', 'Anil Kapoor', 'Bobby Deol', 'Rashmika Mandanna', 'Triptii Dimri'],
    status: 'now_showing',
    createdAt: '2023-12-01T00:00:00.000Z',
  },
  {
    _id: 'mov_dune_part_two',
    title: 'Dune: Part Two',
    slug: 'dune-part-two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    language: 'English',
    durationMinutes: 166,
    releaseDate: '2024-03-01',
    contentRating: 'UA',
    posterUrl: '/assets/posters/dune_part_two.jpg',
    backdropUrl: '/assets/posters/dune_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    status: 'now_showing',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    _id: 'mov_oppenheimer',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    description: 'Christopher Nolans Academy Award-winning masterpiece detailing the life of theoretical physicist J. Robert Oppenheimer, the director of the Manhattan Projects Los Alamos Laboratory during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    durationMinutes: 180,
    releaseDate: '2023-07-21',
    contentRating: 'A',
    posterUrl: '/assets/posters/oppenheimer.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    status: 'now_showing',
    createdAt: '2023-07-21T00:00:00.000Z',
  },
  {
    _id: 'mov_rrr',
    title: 'RRR',
    slug: 'rrr',
    description: 'A fictional story about two legendary Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, and their fight against the British Raj in 1920. Winner of the Academy Award for Best Original Song.',
    genre: ['Action', 'Drama', 'Historical'],
    language: 'Telugu / Hindi',
    durationMinutes: 182,
    releaseDate: '2022-03-25',
    contentRating: 'UA',
    posterUrl: '/assets/posters/rrr.jpg',
    backdropUrl: '/assets/posters/oppenheimer_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJy3_6M',
    cast: ['N. T. Rama Rao Jr.', 'Ram Charan', 'Ajay Devgn', 'Alia Bhatt', 'Shriya Saran'],
    status: 'now_showing',
    createdAt: '2022-03-25T00:00:00.000Z',
  },
  {
    _id: 'mov_interstellar',
    title: 'Interstellar',
    slug: 'interstellar',
    description: 'In Earths future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. A team of astronauts travel through a wormhole near Saturn in search of a new home for mankind.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    durationMinutes: 169,
    releaseDate: '2014-11-07',
    contentRating: 'UA',
    posterUrl: '/assets/posters/interstellar.jpg',
    backdropUrl: '/assets/posters/interstellar_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
    status: 'now_showing',
    createdAt: '2014-11-07T00:00:00.000Z',
  },
  {
    _id: 'mov_pushpa_2',
    title: 'Pushpa 2: The Rule',
    slug: 'pushpa-2-the-rule',
    description: 'The unstoppable rise of Pushpa Raj in the smuggling syndicate continues, bringing him into direct, merciless conflict with SP Bhanwar Singh Shekhawat in an explosive clash of wills and firepower.',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'Telugu / Hindi',
    durationMinutes: 175,
    releaseDate: '2024-12-05',
    contentRating: 'UA',
    posterUrl: '/assets/posters/pushpa_2.jpg',
    backdropUrl: '/assets/posters/dune_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=1kVK0MZlbI4',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Jagapathi Babu'],
    status: 'coming_soon',
    createdAt: '2024-12-05T00:00:00.000Z',
  },
  {
    _id: 'mov_avengers_endgame',
    title: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    description: 'After the devastating cosmic snap by Thanos wiped out half of all life, the remaining Avengers assemble one final time for the ultimate time heist to restore the universe.',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: 'English',
    durationMinutes: 181,
    releaseDate: '2019-04-26',
    contentRating: 'UA',
    posterUrl: '/assets/posters/avengers_endgame.jpg',
    backdropUrl: '/assets/posters/interstellar_backdrop.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
    status: 'coming_soon',
    createdAt: '2019-04-26T00:00:00.000Z',
  },
];

export const STATIC_THEATRES: Theatre[] = [
  {
    _id: 'th_pvr_phoenix',
    name: 'IMovies Cineplex — Phoenix Palladium',
    city: 'Mumbai',
    address: '462 Senapati Bapat Marg, Lower Parel, Mumbai',
    facilities: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Gourmet Dine-In', 'Valet Parking'],
    screens: [
      {
        screenId: 'scr_01',
        screenNumber: 1,
        name: 'Audi 1 (IMAX 3D Laser)',
        screenType: 'IMAX 3D',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatsPerRow: 12,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E', 'F'],
          platinum: ['G', 'H'],
        },
      },
      {
        screenId: 'scr_02',
        screenNumber: 2,
        name: 'Audi 2 (Dolby Cinema)',
        screenType: 'Dolby Cinema',
        rows: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatsPerRow: 10,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D'],
          platinum: ['E', 'F'],
        },
      },
    ],
    status: 'active',
  },
  {
    _id: 'th_inox_bandra',
    name: 'IMovies Grand — Bandra West',
    city: 'Mumbai',
    address: 'Hill Road, Near Bandra Station, Bandra West, Mumbai',
    facilities: ['Dolby Atmos', '4K RGB Laser', 'Lounge Cafe', 'Disabled Access'],
    screens: [
      {
        screenId: 'scr_03',
        screenNumber: 1,
        name: 'Screen 1 (Prime Laser)',
        screenType: 'Standard',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        seatsPerRow: 10,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E'],
          platinum: ['F', 'G'],
        },
      },
    ],
    status: 'active',
  },
  {
    _id: 'th_cine_delhi',
    name: 'IMovies Multiplex — Connaught Place',
    city: 'Delhi',
    address: 'Radial Road 3, Inner Circle, Connaught Place, New Delhi',
    facilities: ['Dolby Atmos', '4K Projection', 'Cafe Bar', 'VIP Valet'],
    screens: [
      {
        screenId: 'scr_04',
        screenNumber: 1,
        name: 'Audi 1 (Dolby Cinema)',
        screenType: 'Dolby Cinema',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        seatsPerRow: 12,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E'],
          platinum: ['F', 'G'],
        },
      },
    ],
    status: 'active',
  },
  {
    _id: 'th_nexus_bengaluru',
    name: 'IMovies Luxe — Nexus Koramangala',
    city: 'Bengaluru',
    address: 'Hosur Road, Koramangala, Bengaluru, Karnataka',
    facilities: ['IMAX 4K Laser', 'Dolby Atmos', 'Recliner Lounges', 'Valet Parking'],
    screens: [
      {
        screenId: 'scr_05',
        screenNumber: 1,
        name: 'Audi 1 (IMAX Laser)',
        screenType: 'IMAX 3D',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatsPerRow: 12,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E', 'F'],
          platinum: ['G', 'H'],
        },
      },
    ],
    status: 'active',
  },
  {
    _id: 'th_prasads_hyderabad',
    name: 'IMovies Prasads — Necklace Road',
    city: 'Hyderabad',
    address: 'Necklace Road, NTR Gardens, Hyderabad, Telangana',
    facilities: ['Giant Screen', 'Dolby Atmos', '4K Projection', 'Gaming Zone'],
    screens: [
      {
        screenId: 'scr_06',
        screenNumber: 1,
        name: 'Audi 1 (Giant Screen)',
        screenType: 'IMAX 3D',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        seatsPerRow: 12,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E', 'F'],
          platinum: ['G', 'H'],
        },
      },
    ],
    status: 'active',
  },
  {
    _id: 'th_phoenix_pune',
    name: 'IMovies Grand — Phoenix Marketcity',
    city: 'Pune',
    address: 'Viman Nagar, Nagar Road, Pune, Maharashtra',
    facilities: ['Dolby Atmos', '4K Laser', 'Food Court', 'VIP Recliners'],
    screens: [
      {
        screenId: 'scr_07',
        screenNumber: 1,
        name: 'Screen 1 (Laser Atmos)',
        screenType: 'Dolby Cinema',
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        seatsPerRow: 10,
        tierRows: {
          silver: ['A', 'B'],
          gold: ['C', 'D', 'E'],
          platinum: ['F', 'G'],
        },
      },
    ],
    status: 'active',
  },
];

export const STATIC_PROMOTIONS: Promotion[] = [
  {
    _id: 'promo_welcome50',
    code: 'IMOVIE50',
    title: 'Welcome to IMovies',
    description: 'Get Flat ₹50 instant discount on your first cinema ticket reservation.',
    discountType: 'flat',
    discountValue: 50,
    minBookingAmount: 200,
    badge: 'WELCOME OFFER',
    validUntil: '2026-12-31',
    bannerGradient: 'from-red-950/70 to-rose-900/50',
    terms: 'Applicable on any show across all participating multiplexes.',
  },
  {
    _id: 'promo_desi20',
    code: 'DESI20',
    title: 'Indian Blockbuster Bonanza',
    description: 'Enjoy 20% OFF on Kalki 2898 AD, Jawan, Stree 2, RRR, and Animal tickets.',
    discountType: 'percentage',
    discountValue: 20,
    minBookingAmount: 300,
    badge: 'TRENDING DEAL',
    validUntil: '2026-11-30',
    bannerGradient: 'from-amber-950/70 to-orange-900/50',
    featuredMovieTitle: 'Kalki 2898 AD & Jawan',
    terms: 'Valid on Hindi, Tamil, Telugu, and Kannada language theatrical screenings.',
  },
  {
    _id: 'promo_imaxlaser',
    code: 'IMAXPASS',
    title: 'IMAX Laser Experience Special',
    description: 'Save ₹100 on premium IMAX 3D screenings for Dune: Part Two and Oppenheimer.',
    discountType: 'flat',
    discountValue: 100,
    minBookingAmount: 500,
    badge: 'IMAX EXCLUSIVE',
    validUntil: '2026-11-20',
    bannerGradient: 'from-sky-950/70 to-blue-900/50',
    terms: 'Valid on Phoenix Palladium and Connaught Place IMAX auditoriums.',
  },
  {
    _id: 'promo_matinee25',
    code: 'MATINEE25',
    title: 'Weekday Matinee Celebration',
    description: 'Flat 25% OFF on morning & matinee shows scheduled before 4:00 PM (Mon-Thu).',
    discountType: 'percentage',
    discountValue: 25,
    minBookingAmount: 250,
    badge: 'WEEKDAY SAVER',
    validUntil: '2026-12-15',
    bannerGradient: 'from-emerald-950/70 to-teal-900/50',
    terms: 'Subject to auditorium seat availability.',
  },
];

export const STATIC_USERS: User[] = [
  {
    _id: 'usr_admin_01',
    name: 'IMovies Chief Administrator',
    email: 'admin@imovies.com',
    role: 'admin',
    preferredCity: 'Mumbai',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'usr_customer_01',
    name: 'Arjun Sharma',
    email: 'customer@imovies.com',
    role: 'customer',
    preferredCity: 'Mumbai',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export interface GeneratedShowData {
  shows: Show[];
  seats: Record<string, SeatItem[]>;
}

export function generateStaticShowsAndSeats(): GeneratedShowData {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const day3 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const day3Str = day3.toISOString().split('T')[0];

  const shows: Show[] = [];
  const seats: Record<string, SeatItem[]> = {};

  const nowShowingMovies = STATIC_MOVIES.filter((m) => m.status === 'now_showing');

  nowShowingMovies.forEach((movie) => {
    STATIC_THEATRES.forEach((theatre) => {
      const screen = theatre.screens[0];
      if (!screen) return;

      const scheduleConfig = [
        { date: todayStr, time: '14:30:00', label: 'Matinee' },
        { date: todayStr, time: '18:45:00', label: 'Prime Evening' },
        { date: tomorrowStr, time: '15:15:00', label: 'Matinee' },
        { date: tomorrowStr, time: '20:00:00', label: 'Night Show' },
        { date: day3Str, time: '17:30:00', label: 'Evening' },
      ];

      scheduleConfig.forEach((cfg, idx) => {
        const showId = `shw_${movie.slug}_${theatre.city.toLowerCase()}_${screen.screenId}_${idx + 1}`;
        const startTime = `${cfg.date}T${cfg.time}.000Z`;
        const endTime = new Date(new Date(startTime).getTime() + (movie.durationMinutes + 30) * 60000).toISOString();

        const showTierPricing = {
          silver: screen.screenType === 'IMAX 3D' ? 280 : 200,
          gold: screen.screenType === 'IMAX 3D' ? 420 : 320,
          platinum: screen.screenType === 'IMAX 3D' ? 580 : 450,
        };

        const show: Show = {
          _id: showId,
          movieId: movie._id,
          theatreId: theatre._id,
          screenId: screen.screenId,
          screenName: screen.name,
          startTime,
          endTime,
          tierPricing: showTierPricing,
          status: 'scheduled',
          movie: {
            _id: movie._id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            language: movie.language,
            durationMinutes: movie.durationMinutes,
            contentRating: movie.contentRating,
          },
          theatre: {
            _id: theatre._id,
            name: theatre.name,
            city: theatre.city,
            address: theatre.address,
            facilities: theatre.facilities,
          },
        };

        // Generate Seat Items for this show
        const showSeats: SeatItem[] = [];
        screen.rows.forEach((rowLetter) => {
          let tier: 'silver' | 'gold' | 'platinum' = 'gold';
          if (screen.tierRows.silver.includes(rowLetter)) tier = 'silver';
          if (screen.tierRows.platinum.includes(rowLetter)) tier = 'platinum';

          const price = showTierPricing[tier];

          for (let num = 1; num <= screen.seatsPerRow; num++) {
            const seatId = `${rowLetter}${num < 10 ? '0' + num : num}`;
            // Pre-simulate realistic booked seats for central spots
            const isSampleBooked = (rowLetter === 'D' || rowLetter === 'E') && (num === 5 || num === 6);
            showSeats.push({
              seatId,
              row: rowLetter,
              number: num,
              tier,
              price,
              status: isSampleBooked ? 'booked' : 'available',
            });
          }
        });

        const bookedCount = showSeats.filter((s) => s.status === 'booked').length;
        show.occupancy = {
          totalSeats: showSeats.length,
          availableSeats: showSeats.length - bookedCount,
          bookedCount,
        };

        shows.push(show);
        seats[showId] = showSeats;
      });
    });
  });

  return { shows, seats };
}
