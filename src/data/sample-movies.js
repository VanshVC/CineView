// Sample movie data for offline/fallback use
const SAMPLE_TRENDING_MOVIES = {
    "page": 1,
    "results": [
        {
            "adult": false,
            "backdrop_path": "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
            "id": 533535,
            "title": "Deadpool & Wolverine",
            "original_language": "en",
            "original_title": "Deadpool & Wolverine",
            "overview": "Third time's the charm. The irresponsible hero Deadpool faces a midlife crisis after the collapse of his universe. To save his world, he reluctantly teams up with an even more reluctant Wolverine.",
            "poster_path": "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
            "media_type": "movie",
            "genre_ids": [28, 12, 35],
            "popularity": 2958.647,
            "release_date": "2024-07-26",
            "video": false,
            "vote_average": 8.2,
            "vote_count": 1234
        },
        {
            "adult": false,
            "backdrop_path": "/qhb1qOilapbapxWQn9jtRCL7QzX.jpg",
            "id": 693134,
            "title": "Dune: Part Two",
            "original_language": "en",
            "original_title": "Dune: Part Two",
            "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
            "poster_path": "/qhb1qOilapbapxWQn9jtRCL7QzX.jpg",
            "media_type": "movie",
            "genre_ids": [878, 12, 28],
            "popularity": 1245.678,
            "release_date": "2024-03-01",
            "video": false,
            "vote_average": 8.4,
            "vote_count": 3456
        },
        {
            "adult": false,
            "backdrop_path": "/7Bd4EUOqQDKZXA6Od5gkfzRNb0.jpg",
            "id": 940551,
            "title": "Godzilla x Kong: The New Empire",
            "original_language": "en",
            "original_title": "Godzilla x Kong: The New Empire",
            "overview": "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
            "poster_path": "/7Bd4EUOqQDKZXA6Od5gkfzRNb0.jpg",
            "media_type": "movie",
            "genre_ids": [878, 28, 12],
            "popularity": 1089.543,
            "release_date": "2024-03-29",
            "video": false,
            "vote_average": 7.8,
            "vote_count": 2345
        },
        {
            "adult": false,
            "backdrop_path": "/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg",
            "id": 673593,
            "title": "Civil War",
            "original_language": "en",
            "original_title": "Civil War",
            "overview": "In a near-future America torn by political and social divisions, a team of journalists travel across the country during a rapidly escalating civil war between the Federal Government and the Western States.",
            "poster_path": "/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg",
            "media_type": "movie",
            "genre_ids": [28, 53, 18],
            "popularity": 987.654,
            "release_date": "2024-04-12",
            "video": false,
            "vote_average": 7.2,
            "vote_count": 1567
        },
        {
            "adult": false,
            "backdrop_path": "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
            "id": 609681,
            "title": "Kingdom of the Planet of the Apes",
            "original_language": "en",
            "original_title": "Kingdom of the Planet of the Apes",
            "overview": "Several generations in the future following Caesar's reign, apes are now the dominant species and live harmoniously while humans have been reduced to living in the shadows. As a new tyrannical ape leader builds his empire, one young ape undertakes a harrowing journey that will cause him to question all that he has known about the past and to make choices that will define a future for apes and humans alike.",
            "poster_path": "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
            "media_type": "movie",
            "genre_ids": [878, 12, 28],
            "popularity": 876.543,
            "release_date": "2024-05-10",
            "video": false,
            "vote_average": 7.5,
            "vote_count": 1890
        },
        {
            "adult": false,
            "backdrop_path": "/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg",
            "id": 848538,
            "title": "The Fall Guy",
            "original_language": "en",
            "original_title": "The Fall Guy",
            "overview": "A former stuntman, working as a bounty hunter, is tasked with finding a missing movie star and uncovering a conspiracy in the process.",
            "poster_path": "/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg",
            "media_type": "movie",
            "genre_ids": [28, 35, 10749],
            "popularity": 765.432,
            "release_date": "2024-05-03",
            "video": false,
            "vote_average": 7.8,
            "vote_count": 1234
        },
        {
            "adult": false,
            "backdrop_path": "/4woSOUD0equAYzvwhWBHIJDCM88.jpg",
            "id": 1096197,
            "title": "No Way Up",
            "original_language": "en",
            "original_title": "No Way Up",
            "overview": "Characters from different backgrounds are thrown together when the plane they're travelling on crashes into the Pacific Ocean. A nightmare fight for survival ensues with the air supply running out and dangers creeping in from all sides.",
            "poster_path": "/4woSOUD0equAYzvwhWBHIJDCM88.jpg",
            "media_type": "movie",
            "genre_ids": [28, 53, 27],
            "popularity": 654.321,
            "release_date": "2024-01-18",
            "video": false,
            "vote_average": 6.5,
            "vote_count": 987
        },
        {
            "adult": false,
            "backdrop_path": "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
            "id": 872585,
            "title": "Oppenheimer",
            "original_language": "en",
            "original_title": "Oppenheimer",
            "overview": "The story of American scientist, J. Robert Oppenheimer, and his role in the development of the atomic bomb.",
            "poster_path": "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
            "media_type": "movie",
            "genre_ids": [18, 36],
            "popularity": 543.21,
            "release_date": "2023-07-21",
            "video": false,
            "vote_average": 8.1,
            "vote_count": 5678
        },
        {
            "adult": false,
            "backdrop_path": "/xvk5AhfhgQcTuaCQyq1XqChQOKi.jpg",
            "id": 1022796,
            "title": "Furiosa: A Mad Max Saga",
            "original_language": "en",
            "original_title": "Furiosa: A Mad Max Saga",
            "overview": "As the world fell, young Furiosa is snatched from the Green Place of Many Mothers and falls into the hands of a great Biker Horde led by the Warlord Dementus. Sweeping through the Wasteland, they come across the Citadel presided over by The Immortan Joe. While the two Tyrants war for dominance, Furiosa must survive many trials as she puts together the means to find her way home.",
            "poster_path": "/xvk5AhfhgQcTuaCQyq1XqChQOKi.jpg",
            "media_type": "movie",
            "genre_ids": [28, 12, 878],
            "popularity": 432.1,
            "release_date": "2024-05-24",
            "video": false,
            "vote_average": 7.9,
            "vote_count": 1234
        },
        {
            "adult": false,
            "backdrop_path": "/oBIQDKcqNxKckjugtmzpIIOgoc4.jpg",
            "id": 969492,
            "title": "Land of Bad",
            "original_language": "en",
            "original_title": "Land of Bad",
            "overview": "When a Delta Force special ops mission goes terribly wrong, Air Force drone pilot Reaper has 48 hours to remedy what has devolved into a wild rescue operation. With no weapons and no communication other than the drone above, the ground mission suddenly becomes a full-scale battle when the team is discovered by the enemy.",
            "poster_path": "/oBIQDKcqNxKckjugtmzpIIOgoc4.jpg",
            "media_type": "movie",
            "genre_ids": [28, 53],
            "popularity": 321.098,
            "release_date": "2024-01-25",
            "video": false,
            "vote_average": 7.0,
            "vote_count": 876
        }
    ],
    "total_pages": 1000,
    "total_results": 20000
};

const SAMPLE_TV_SHOWS = {
    "page": 1,
    "results": [
        {
            "backdrop_path": "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
            "first_air_date": "2023-01-15",
            "genre_ids": [18, 10765],
            "id": 100088,
            "name": "The Last of Us",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "The Last of Us",
            "overview": "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the United States and depend on each other for survival.",
            "popularity": 1234.567,
            "poster_path": "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
            "vote_average": 8.8,
            "vote_count": 4321
        },
        {
            "backdrop_path": "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
            "first_air_date": "2018-06-03",
            "genre_ids": [18, 35],
            "id": 76331,
            "name": "Succession",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "Succession",
            "overview": "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
            "popularity": 987.654,
            "poster_path": "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
            "vote_average": 8.7,
            "vote_count": 3456
        },
        {
            "backdrop_path": "/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
            "first_air_date": "2022-08-21",
            "genre_ids": [10765, 18, 10759],
            "id": 94997,
            "name": "House of the Dragon",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "House of the Dragon",
            "overview": "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne. But when Viserys later fathers a son, the court is shocked when Rhaenyra retains her status as his heir, and seeds of division sow friction across the realm.",
            "popularity": 876.543,
            "poster_path": "/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
            "vote_average": 8.5,
            "vote_count": 2345
        },
        {
            "backdrop_path": "/7Bn6tVlG8gCR1CJT7ibJKZbUMh7.jpg",
            "first_air_date": "2016-11-04",
            "genre_ids": [18, 36],
            "id": 65494,
            "name": "The Crown",
            "origin_country": ["GB"],
            "original_language": "en",
            "original_name": "The Crown",
            "overview": "The gripping, decades-spanning inside story of Her Majesty Queen Elizabeth II and the Prime Ministers who shaped Britain's post-war destiny. The Crown tells the inside story of two of the most famous addresses in the world – Buckingham Palace and 10 Downing Street – and the intrigues, love lives and machinations behind the great events that shaped the second half of the 20th century.",
            "popularity": 765.432,
            "poster_path": "/7Bn6tVlG8gCR1CJT7ibJKZbUMh7.jpg",
            "vote_average": 8.3,
            "vote_count": 1987
        },
        {
            "backdrop_path": "/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg",
            "first_air_date": "2022-02-18",
            "genre_ids": [10765, 9648, 18],
            "id": 95396,
            "name": "Severance",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "Severance",
            "overview": "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
            "popularity": 654.321,
            "poster_path": "/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg",
            "vote_average": 8.7,
            "vote_count": 1765
        },
        {
            "backdrop_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
            "first_air_date": "2008-01-20",
            "genre_ids": [18, 80],
            "id": 1396,
            "name": "Breaking Bad",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "Breaking Bad",
            "overview": "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
            "popularity": 543.21,
            "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
            "vote_average": 9.5,
            "vote_count": 8765
        },
        {
            "backdrop_path": "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
            "first_air_date": "2016-07-15",
            "genre_ids": [10765, 18, 9648],
            "id": 66732,
            "name": "Stranger Things",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "Stranger Things",
            "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
            "popularity": 432.1,
            "poster_path": "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
            "vote_average": 8.6,
            "vote_count": 7654
        },
        {
            "backdrop_path": "/6POBWybSBDBKjSs1VAQcnQC1qyt.jpg",
            "first_air_date": "2022-11-23",
            "genre_ids": [10765, 35, 80],
            "id": 119051,
            "name": "Wednesday",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "Wednesday",
            "overview": "Wednesday Addams is sent to Nevermore Academy, a bizarre boarding school where she attempts to master her psychic powers, stop a monstrous killing spree of the town citizens, and solve the supernatural mystery that affected her family 25 years ago — all while navigating her new relationships.",
            "popularity": 321.098,
            "poster_path": "/6POBWybSBDBKjSs1VAQcnQC1qyt.jpg",
            "vote_average": 8.2,
            "vote_count": 6543
        },
        {
            "backdrop_path": "/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
            "first_air_date": "2019-12-20",
            "genre_ids": [10765, 18, 10759],
            "id": 71912,
            "name": "The Witcher",
            "origin_country": ["US"],
            "original_language": "en",
            "original_name": "The Witcher",
            "overview": "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.",
            "popularity": 210.987,
            "poster_path": "/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
            "vote_average": 8.1,
            "vote_count": 5432
        },
        {
            "backdrop_path": "/7tNTPZMb13W0AhkcuoL6myRrNRr.jpg",
            "first_air_date": "2021-09-17",
            "genre_ids": [10759, 9648, 18],
            "id": 93405,
            "name": "Squid Game",
            "origin_country": ["KR"],
            "original_language": "ko",
            "original_name": "오징어 게임",
            "overview": "Hundreds of cash-strapped players accept a strange invitation to compete in children's games—with high stakes. But, a tempting prize awaits the victor.",
            "popularity": 109.876,
            "poster_path": "/7tNTPZMb13W0AhkcuoL6myRrNRr.jpg",
            "vote_average": 8.0,
            "vote_count": 4321
        }
    ],
    "total_pages": 500,
    "total_results": 10000
};

const SAMPLE_GENRES = {
    "genres": [
        {
            "id": 28,
            "name": "Action"
        },
        {
            "id": 12,
            "name": "Adventure"
        },
        {
            "id": 16,
            "name": "Animation"
        },
        {
            "id": 35,
            "name": "Comedy"
        },
        {
            "id": 80,
            "name": "Crime"
        },
        {
            "id": 99,
            "name": "Documentary"
        },
        {
            "id": 18,
            "name": "Drama"
        },
        {
            "id": 10751,
            "name": "Family"
        },
        {
            "id": 14,
            "name": "Fantasy"
        },
        {
            "id": 36,
            "name": "History"
        },
        {
            "id": 27,
            "name": "Horror"
        },
        {
            "id": 10402,
            "name": "Music"
        },
        {
            "id": 9648,
            "name": "Mystery"
        },
        {
            "id": 10749,
            "name": "Romance"
        },
        {
            "id": 878,
            "name": "Science Fiction"
        },
        {
            "id": 10770,
            "name": "TV Movie"
        },
        {
            "id": 53,
            "name": "Thriller"
        },
        {
            "id": 10752,
            "name": "War"
        },
        {
            "id": 37,
            "name": "Western"
        }
    ]
};