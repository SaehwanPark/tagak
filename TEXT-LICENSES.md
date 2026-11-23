# 연습문 출처와 라이선스

이 문서는 앱이 실제로 읽는 연습문의 출처와 라이선스 정보를 한곳에 모은 것이다. 한 줄 출처 표기와 글 고르기 목록이 같은 애셋 메타데이터를 사용하도록, 이 파일은 `src/content`의 콘텐츠 모듈에서 자동 생성한다.

> 이 파일은 직접 고치지 않는다. 애셋을 바꾼 뒤 `npm run text-licenses:update`로 다시 생성하고, `npm run test`로 애셋 메타데이터와의 일치를 확인한다.

## 요약

| 자료 묶음 | 개수 | 출처 유형·라이선스 | 애셋 |
| --- | --- | --- | --- |
| 한국어 한 줄 | 69 | 직접 작성 12 · 짧은 인용 20 · 격언·속담 37 | `src/content/assets/one-line.ko.json` |
| 영어 한 줄 | 55 | 직접 작성 6 · 짧은 인용 13 · 격언·속담 36 | `src/content/assets/one-line.en.json` |
| 한국어 낱말 | 8 | 직접 작성 | `src/content/assets/words.ko.json` |
| 영어 낱말 | 8 | 직접 작성 | `src/content/assets/words.en.json` |
| 30초 낱말 도전 | 28 | 직접 작성 | `src/content/assets/challenge-words.json` |
| 한국어 짧은 글 | 36 | 직접 작성 14 · CC BY-SA 4.0 21 · 퍼블릭 도메인 1 | `src/content/assets/passages.ko.json` |
| 한국어 긴 글 | 9 | 직접 작성 2 · CC BY-SA 4.0 7 · 퍼블릭 도메인 0 | `src/content/assets/passages.ko.json` |
| 영어 짧은 글 | 16 | 직접 작성 5 · CC BY-SA 4.0 11 | `src/content/assets/passages.en.json` |
| 영어 긴 글 | 7 | 직접 작성 1 · CC BY-SA 4.0 6 | `src/content/assets/passages.en.json` |
| **글 전체** | **68** | 직접 작성 22 · 복제 46 | `src/content/assets/passages.*.json` |

## 라이선스 표기

- **직접 작성**: 이 프로젝트에서 새로 쓴 원문이다. 별도 출처 표기가 필요 없으며 애셋의 `license`는 `original`이다.
- **짧은 인용**: 애니메이션·게임·영화에서 가져온 짧은 문장이다. 애셋에 작품명, 발화자, HTTPS 출처 URL을 기록하고 한 줄 연습 화면에 출처를 표시한다. 노래 가사와 긴 대사는 포함하지 않는다.
- **격언·속담**: 구전 속담과 오래된 격언이다. 애셋에 전승·저자·참고 출처를 기록하고 한 줄 연습 화면에 표시한다.
- **CC BY-SA 4.0**: 위키문헌·위키백과에서 가져온 발췌문이다. 저자·출처·원문 URL을 애셋의 `credit`에 남기고 글 고르기 목록에 표시한다. 배포 시 같은 라이선스 조건과 출처 표기를 유지한다.
- **퍼블릭 도메인**: 저작권 보호 기간이 끝났거나 법령에 따라 보호받지 않는 자료다. 현재는 대한민국헌법 전문을 사용하며, 애셋에는 출처를 함께 남긴다.

## 한 줄 연습

### 한국어 (69)

| ID | 연습문 | 출처 유형 | 저자·발화자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- |
| `first-steps` | 손끝에 다시 익숙해지기 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-window` | 창가의 아침 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-tea` | 따뜻한 차 한 잔 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-lamp` | 늦은 귀가 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-letter` | 오래된 편지 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-morning` | 아침 시장 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-stars` | 별을 세는 시간 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-rain` | 비 오는 오후 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-bicycle` | 자전거 길 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-cat` | 창가의 고양이 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-library` | 도서관의 오후 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-night-train` | 밤기차 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-slamdunk-left` | 애니메이션 명대사 | 짧은 인용 | 강백호 | 《슬램덩크》 | [열기](https://www.youtube.com/watch?v=rD-mTNjXaZI) |
| `ko-quote-slamdunk-give-up` | 애니메이션 명대사 | 짧은 인용 | 안 선생님 | 《슬램덩크》 | [열기](https://sekihi.net/ko-kr/stones/6942) |
| `ko-quote-one-piece` | 애니메이션 명대사 | 짧은 인용 | 몽키 D. 루피 | 《원피스》 1화 | [열기](https://tv.apple.com/kr/episode/%E1%84%82%E1%85%A1%E1%84%82%E1%85%B3%E1%86%AB%E1%84%8B%E1%85%A3-%E1%84%85%E1%85%AE%E1%84%91%E1%85%B5-%E1%84%92%E1%85%A2%E1%84%8C%E1%85%A5%E1%86%A8%E1%84%8B%E1%85%AA%E1%86%BC%E1%84%8B%E1%85%B5-%E1%84%83%E1%85%AC%E1%86%AF-%E1%84%80%E1%85%A5%E1%84%8B%E1%85%A3/umc.cmc.3i6gftpoqek3o947i6nlnjzg6?showId=umc.cmc.2jf3h5bibsseewr9bh0rg5kcl) |
| `ko-quote-pokemon` | 애니메이션 명대사 | 짧은 인용 | 한지우 | 《극장판 포켓몬스터: 너로 정했다!》 | [열기](https://new.pokemonkorea.co.kr/animation/34) |
| `ko-quote-conan` | 애니메이션 명대사 | 짧은 인용 | 에도가와 코난 | 《명탐정 코난》 | [열기](https://artplex.co.kr/campaigns/detective-conan_2026jan.html) |
| `ko-quote-demon-slayer` | 애니메이션 명대사 | 짧은 인용 | 렌고쿠 쿄쥬로 | 《귀멸의 칼날: 무한열차편》 | [열기](https://tv.apple.com/kr/episode/%E1%84%86%E1%85%A1%E1%84%8B%E1%85%B3%E1%86%B7%E1%84%8B%E1%85%B3%E1%86%AF-%E1%84%87%E1%85%AE%E1%86%AF%E1%84%90%E1%85%A2%E1%84%8B%E1%85%AF%E1%84%85%E1%85%A1/umc.cmc.3k1fhmt282os5xbxiaqmbksv2?showId=umc.cmc.1lfa5s90fe9hsizlhvvkcpxiq) |
| `ko-quote-naruto` | 애니메이션 명대사 | 짧은 인용 | 우즈마키 나루토 | 《나루토》 | [열기](https://jyucom.tistory.com/entry/%EB%82%98%EB%A3%A8%ED%86%A0-%EC%95%A0%EB%8B%88-%ED%8C%AC%EC%9D%B4%EB%9D%BC%EB%A9%B4-%EA%BC%AD-%EC%95%8C%EC%95%84%EC%95%BC-%ED%95%A0-%EB%AA%A8%EB%93%A0-%EA%B2%83) |
| `ko-quote-my-hero` | 애니메이션 명대사 | 짧은 인용 | 올마이트 | 《나의 히어로 아카데미아》 | [열기](https://note.com/hazumu_rhythm/n/n59bbdbde6e8f?hl=ko) |
| `ko-quote-fullmetal` | 애니메이션 명대사 | 짧은 인용 | 에드워드 엘릭 | 《강철의 연금술사》 | [열기](https://en.wikiquote.org/wiki/Fullmetal_Alchemist) |
| `ko-quote-toy-story` | 애니메이션 명대사 | 짧은 인용 | 버즈 라이트이어 | 《토이 스토리》 | [열기](https://news.disney.com/ultimate-list-toy-story-quotes) |
| `ko-quote-zelda` | 게임 명대사 | 짧은 인용 | 노인 · 한국어 번역 | 《젤다의 전설》 | [열기](https://zelda.nintendo.com/breath-of-the-wild/assets/pdfs/ExplorersGuide.pdf) |
| `ko-quote-portal` | 게임 명대사 | 짧은 인용 | 벽의 낙서 · 한국어 번역 | 《포털》 | [열기](https://en.wikipedia.org/wiki/The_cake_is_a_lie) |
| `ko-quote-skyrim` | 게임 명대사 | 짧은 인용 | 경비병 | 《엘더스크롤 V: 스카이림》 | [열기](https://elderscrolls.bethesda.net/ko-KR/news/6KNyeH7wG4FOFIEev8VaX1/how-an-arrow-in-the-knee-made-its-way-to-skyrim) |
| `ko-quote-overwatch` | 게임 명대사 | 짧은 인용 | 메르시 | 《오버워치》 | [열기](https://overwatch.blizzard.com/ko-kr/news/23223599/take-flight-in-mercy-s-recall-challenge/) |
| `ko-quote-diablo` | 게임 명대사 | 짧은 인용 | 데커드 케인 · 한국어 번역 | 《디아블로》 | [열기](https://en.wikiquote.org/wiki/Diablo) |
| `ko-quote-starcraft` | 게임 명대사 | 짧은 인용 | 프로토스 사령관 | 《스타크래프트》 | [열기](https://starcraft.fandom.com/wiki/Pylon) |
| `ko-quote-metal-gear` | 게임 명대사 | 짧은 인용 | 솔리드 스네이크 · 한국어 번역 | 《메탈 기어 솔리드 2》 | [열기](https://quotegeek.com/games/metal-gear-solid-2-sons-of-liberty/kept-you-waiting-huh/) |
| `ko-quote-bioshock` | 게임 명대사 | 짧은 인용 | 아틀라스 · 한국어 번역 | 《바이오쇼크》 | [열기](https://en.wikiquote.org/wiki/BioShock) |
| `ko-quote-ace-attorney` | 게임 명대사 | 짧은 인용 | 나루호도 류이치 | 《역전재판》 | [열기](https://news.capcomusa.com/lets/browse/ace-attorney-101-with-phoenix-wright-and-maya-fey) |
| `ko-quote-street-fighter` | 게임 명대사 | 짧은 인용 | 류 | 《스트리트 파이터》 | [열기](https://www.streetfighter.com/6/character/ryu) |
| `ko-saying-proverb-01` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-02` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-03` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-04` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-05` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-06` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-07` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-08` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-09` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-10` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-11` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-12` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-13` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-14` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-15` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-16` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-17` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-18` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-19` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-20` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-21` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-22` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-23` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-24` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-25` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-26` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-27` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-28` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-29` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-30` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-31` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-32` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-bacon` | 한국 격언·속담 | 격언·속담 | 프랜시스 베이컨 | 격언 · 지식은 힘이다 | [열기](https://en.wikipedia.org/wiki/Knowledge_is_power) |
| `ko-saying-franklin` | 한국 격언·속담 | 격언·속담 | 벤저민 프랭클린 | 《젊은 상인에게 주는 조언》 | [열기](https://en.wikipedia.org/wiki/Benjamin_Franklin) |
| `ko-saying-delphi` | 한국 격언·속담 | 격언·속담 | 델포이 격언 | 고대 그리스 격언 | [열기](https://en.wikipedia.org/wiki/Know_thyself) |
| `ko-saying-descartes` | 한국 격언·속담 | 격언·속담 | 르네 데카르트 | 《방법서설》 | [열기](https://en.wikipedia.org/wiki/Cogito,_ergo_sum) |
| `ko-saying-hippocrates` | 한국 격언·속담 | 격언·속담 | 히포크라테스 | 《아포리즘》 | [열기](https://en.wikipedia.org/wiki/Hippocrates) |

### 영어 (55)

| ID | 연습문 | 출처 유형 | 저자·발화자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- |
| `en-window` | Morning at the window | 직접 작성 | — | 타각 직접 작성 | — |
| `en-tea` | A quiet morning | 직접 작성 | — | 타각 직접 작성 | — |
| `en-lamp` | The last lamp | 직접 작성 | — | 타각 직접 작성 | — |
| `en-letter` | An old letter | 직접 작성 | — | 타각 직접 작성 | — |
| `en-train` | The night train | 직접 작성 | — | 타각 직접 작성 | — |
| `en-stars` | Counting stars | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-gone-with-the-wind` | Movie quotes | 짧은 인용 | Rhett Butler | Gone with the Wind | [열기](https://www.afi.com/afis-100-years-100-movie-quotes/) |
| `en-quote-casablanca` | Movie quotes | 짧은 인용 | Rick Blaine | Casablanca | [열기](https://www.afi.com/afis-100-years-100-movie-quotes/) |
| `en-quote-star-wars` | Movie quotes | 짧은 인용 | A farewell | Star Wars | [열기](https://www.afi.com/afis-100-years-100-movie-quotes/) |
| `en-quote-terminator` | Movie quotes | 짧은 인용 | The Terminator | The Terminator | [열기](https://www.afi.com/afis-100-years-100-movie-quotes/) |
| `en-quote-et` | Movie quotes | 짧은 인용 | E.T. | E.T. the Extra-Terrestrial | [열기](https://www.afi.com/afis-100-years-100-movie-quotes/) |
| `en-quote-a-few-good-men` | Movie quotes | 짧은 인용 | Nathan R. Jessep | A Few Good Men | [열기](https://quotations.pro/people/nathan-jessup/quote/you-cant-handle-the-truth) |
| `en-quote-dark-knight` | Movie quotes | 짧은 인용 | The Joker | The Dark Knight | [열기](https://www.acmi.net.au/stories-and-ideas/the-dark-knight-why-so-serious/) |
| `en-quote-sixth-sense` | Movie quotes | 짧은 인용 | Cole Sear | The Sixth Sense | [열기](https://catalog.afi.com/Film/55204-THE-SIXTH-SENSE) |
| `en-quote-jerry-maguire` | Movie quotes | 짧은 인용 | Dorothy Boyd | Jerry Maguire | [열기](https://en.wikiquote.org/wiki/Jerry_Maguire) |
| `en-quote-dirty-dancing` | Movie quotes | 짧은 인용 | Johnny Castle | Dirty Dancing | [열기](https://en.wikiquote.org/wiki/Dirty_Dancing) |
| `en-quote-jaws` | Movie quotes | 짧은 인용 | Martin Brody | Jaws | [열기](https://www.tcm.com/articles/615785/trivia-jaws-trivia-and-fun-facts-about-jaws) |
| `en-quote-toy-story` | Movie quotes | 짧은 인용 | Buzz Lightyear | Toy Story | [열기](https://news.disney.com/ultimate-list-toy-story-quotes) |
| `en-quote-wizard-of-oz` | Movie quotes | 짧은 인용 | Dorothy Gale | The Wizard of Oz | [열기](https://www.youtube.com/watch?v=NFWMBE-mQEc) |
| `en-saying-proverb-01` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-02` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-03` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-04` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-05` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-06` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-07` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-08` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-09` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-10` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-11` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-12` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-13` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-14` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-15` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-16` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-17` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-18` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-19` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-20` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-21` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-22` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-23` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-24` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-25` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-26` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-27` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-28` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-29` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-30` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-lao-tzu` | English proverbs & sayings | 격언·속담 | Lao Tzu | Tao Te Ching | [열기](https://en.wikipedia.org/wiki/Tao_Te_Ching) |
| `en-saying-bacon` | English proverbs & sayings | 격언·속담 | Francis Bacon | Meditationes Sacrae | [열기](https://en.wikipedia.org/wiki/Knowledge_is_power) |
| `en-saying-franklin` | English proverbs & sayings | 격언·속담 | Benjamin Franklin | Advice to a Young Tradesman | [열기](https://en.wikipedia.org/wiki/Benjamin_Franklin) |
| `en-saying-delphi` | English proverbs & sayings | 격언·속담 | Delphic maxim | Ancient Greek aphorism | [열기](https://en.wikipedia.org/wiki/Know_thyself) |
| `en-saying-descartes` | English proverbs & sayings | 격언·속담 | René Descartes | Discourse on the Method | [열기](https://en.wikipedia.org/wiki/Cogito,_ergo_sum) |
| `en-saying-hippocrates` | English proverbs & sayings | 격언·속담 | Hippocrates | Aphorisms | [열기](https://en.wikipedia.org/wiki/Hippocrates) |

## 낱말 연습

### 한국어 (8)

| ID | 연습문 | 출처 유형 | 저자·발화자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- |
| `ko-pencil` | 연필 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-window-word` | 창문 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-river` | 강물 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-breath` | 숨결 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-morning-word` | 아침 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-starlight` | 별빛 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-footstep` | 발걸음 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-notebook` | 공책 | 직접 작성 | — | 타각 직접 작성 | — |

### 영어 (8)

| ID | 연습문 | 출처 유형 | 저자·발화자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- |
| `en-orchard` | orchard | 직접 작성 | — | 타각 직접 작성 | — |
| `en-lantern` | lantern | 직접 작성 | — | 타각 직접 작성 | — |
| `en-harbor` | harbor | 직접 작성 | — | 타각 직접 작성 | — |
| `en-meadow` | meadow | 직접 작성 | — | 타각 직접 작성 | — |
| `en-compass` | compass | 직접 작성 | — | 타각 직접 작성 | — |
| `en-thunder` | thunder | 직접 작성 | — | 타각 직접 작성 | — |
| `en-library` | library | 직접 작성 | — | 타각 직접 작성 | — |
| `en-summer` | summer | 직접 작성 | — | 타각 직접 작성 | — |

## 30초 낱말 도전

모든 도전 낱말은 직접 작성한 원문이다.

총 28개: 바람, 새벽, 연못, 우산, 모래, 햇살, 노을, 고래, 구름, 별빛, 산책, 물결, 종이, 나무, 달빛, 여행, 편지, 창가, 정원, 계절, 바다, 숲길, 노래, 기억, 마음, 하늘, 빗소리, 등불

## 짧은 글

### 한국어 (36)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `dawn-river` | 새벽 강변 | life | 직접 작성 | — | 자체 제작 | — |
| `small-library` | 작은 도서관 | life | 직접 작성 | — | 자체 제작 | — |
| `bakery-alley` | 골목의 빵집 | life | 직접 작성 | — | 자체 제작 | — |
| `autumn-walk` | 가을 산책 | literature | 직접 작성 | — | 자체 제작 | — |
| `city-stars` | 도시에서 별을 보는 법 | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `first-computer` | 첫 컴퓨터 | technology | 직접 작성 | — | 자체 제작 | — |
| `radio-repair` | 오래된 라디오 | technology | 직접 작성 | — | 자체 제작 | — |
| `night-market` | 밤 시장 | life | 직접 작성 | — | 자체 제작 | — |
| `sea-time` | 바다의 시간 | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `cat-window` | 고양이와 창가 | literature | 직접 작성 | — | 자체 제작 | — |
| `station-morning` | 정거장의 아침 | subculture | 직접 작성 | — | 자체 제작 | — |
| `robot-gardener` | 로봇 정원사 | subculture | 직접 작성 | — | 자체 제작 | — |
| `fantasy-inn` | 여행자의 여관 | subculture | 직접 작성 | — | 자체 제작 | — |
| `moon-poem` | 달빛 아래 | literature | 직접 작성 | — | 자체 제작 | — |
| `unsworn-morning` | 운수 좋은 날 (발췌) | literature | CC BY-SA 4.0 | 현진건 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/운수_좋은_날) |
| `typewriter-history` | 타자기의 역사 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/타자기) |
| `constitution-preamble` | 대한민국헌법 전문 | nonfiction | 퍼블릭 도메인 | 대한민국 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/대한민국헌법_(제10호)) |
| `hancom-typing-web` | 웹 기반 한컴 타자연습 | subculture | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/한컴_타자연습) |
| `angbuilgu` | 앙부일구 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%95%99%EB%B6%80%EC%9D%BC%EA%B5%AC) |
| `baettaragi` | 배따라기 (발췌) | literature | CC BY-SA 4.0 | 김동인 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/배따라기) |
| `buckwheat` | 메밀꽃 필 무렵 (발췌) | literature | CC BY-SA 4.0 | 이효석 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/메밀꽃_필_무렵) |
| `camellia` | 동백꽃 (발췌) | literature | CC BY-SA 4.0 | 김유정 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/동백꽃) |
| `hangul-day` | 한글날 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B8%80%EB%82%A0) |
| `hanok` | 한옥 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%95%9C%EC%98%A5) |
| `hunminjeongeum` | 훈민정음 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%9B%88%EB%AF%BC%EC%A0%95%EC%9D%8C) |
| `jikji` | 직지심체요절 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%A7%81%EC%A7%80%EC%8B%AC%EC%B2%B4%EC%9A%94%EC%A0%88) |
| `kimchi` | 김치 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EA%B9%80%EC%B9%98) |
| `ondol` | 온돌 | life | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%98%A8%EB%8F%8C) |
| `pansori` | 판소리 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%8C%90%EC%86%8C%EB%A6%AC) |
| `rain-gauge` | 측우기 | technology | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%B8%A1%EC%9A%B0%EA%B8%B0) |
| `rhythm-game` | 리듬 게임 | subculture | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EB%A6%AC%EB%93%AC_%EA%B2%8C%EC%9E%84) |
| `spring-spring` | 봄봄 (발췌) | literature | CC BY-SA 4.0 | 김유정 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/봄봄) |
| `talchum` | 탈춤 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%ED%83%88%EC%B6%A4) |
| `turtle-ship` | 거북선 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EA%B1%B0%EB%B6%81%EC%84%A0) |
| `webtoon` | 웹툰 | subculture | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%9B%B9%ED%88%B0) |
| `yi-sun-sin` | 이순신 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%9D%B4%EC%88%9C%EC%8B%A0) |

### 영어 (16)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `rain-window` | The rain window | literature | 직접 작성 | — | 자체 제작 | — |
| `small-library-en` | The small library | life | 직접 작성 | — | 자체 제작 | — |
| `night-train-en` | The night train | literature | 직접 작성 | — | 자체 제작 | — |
| `signal-stars` | Signals from the night sky | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `last-arcade` | The last arcade | subculture | 직접 작성 | — | 자체 제작 | — |
| `hangul-english` | Hangul | nonfiction | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Hangul) |
| `bicycle` | Bicycle | life | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Bicycle) |
| `coffee` | Coffee | life | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Coffee) |
| `jazz` | Jazz | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Jazz) |
| `joseon-en` | Joseon | nonfiction | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Joseon) |
| `qwerty` | QWERTY | technology | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/QWERTY) |
| `retrocomputing` | Retrocomputing | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Retrocomputing) |
| `seoul` | Seoul | nonfiction | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Seoul) |
| `steampunk` | Steampunk | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Steampunk) |
| `typewriter-en` | Typewriter | technology | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Typewriter) |
| `video-game` | Video game | subculture | CC BY-SA 4.0 | Wikipedia contributors | English Wikipedia | [열기](https://en.wikipedia.org/wiki/Video_game) |

## 긴 글

### 한국어 (9)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `river-city` | 강과 도시 | nonfiction | 직접 작성 | — | 자체 제작 | — |
| `star-road` | 별길 여행자 | subculture | 직접 작성 | — | 자체 제작 | — |
| `wings-room` | 날개 (발췌) | literature | CC BY-SA 4.0 | 이상 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/날개) |
| `hangul-story` | 한글의 이름과 창제 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/한글) |
| `flame-sonata` | 광염 소나타 (발췌) | literature | CC BY-SA 4.0 | 김동인 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/광염_소나타) |
| `joseon` | 조선 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EC%A1%B0%EC%84%A0) |
| `provisional-government` | 대한민국 임시정부 | nonfiction | CC BY-SA 4.0 | 위키백과 기여자 | 한국어 위키백과 | [열기](https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD_%EC%9E%84%EC%8B%9C%EC%A0%95%EB%B6%80) |
| `ready-made-life` | 레디메이드 인생 (발췌) | literature | CC BY-SA 4.0 | 채만식 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/레디메이드_인생) |
| `water-mill` | 물레방아 (발췌) | literature | CC BY-SA 4.0 | 나도향 | 한국어 위키문헌 | [열기](https://ko.wikisource.org/wiki/물레방아) |

### 영어 (7)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- | --- |
| `long-way-home` | The long way home | literature | 직접 작성 | — | 자체 제작 | — |
| `gift-of-the-magi` | The Gift of the Magi (excerpt) | literature | CC BY-SA 4.0 | O. Henry | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Four_Million/The_Gift_of_the_Magi) |
| `monkeys-paw` | The Monkey's Paw (excerpt) | literature | CC BY-SA 4.0 | W. W. Jacobs | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Lady_of_the_Barge/The_Monkey%27s_Paw) |
| `open-boat` | The Open Boat (excerpt) | literature | CC BY-SA 4.0 | Stephen Crane | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Open_Boat) |
| `scandal-bohemia` | A Scandal in Bohemia (excerpt) | literature | CC BY-SA 4.0 | Arthur Conan Doyle | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_(1892,_US)/A_Scandal_in_Bohemia) |
| `tell-tale-heart` | The Tell-Tale Heart (excerpt) | literature | CC BY-SA 4.0 | Edgar Allan Poe | English Wikisource | [열기](https://en.wikisource.org/wiki/Mystery_Tales_of_Edgar_Allan_Poe/The_Tell-Tale_Heart) |
| `yellow-wallpaper` | The Yellow Wall Paper (excerpt) | literature | CC BY-SA 4.0 | Charlotte Perkins Gilman | English Wikisource | [열기](https://en.wikisource.org/wiki/The_Yellow_Wall_Paper) |

## 새 연습문을 추가할 때

1. 알맞은 애셋에 항목을 추가한다. 한 줄·낱말·도전 낱말은 `src/content/assets/`의 JSON에 넣는다.
2. 인용·전승 한 줄에는 `source`와 저자·출처·HTTPS URL을 담은 `credit`을 함께 적는다. 직접 작성한 한 줄은 기존처럼 `source: "original"`로 둔다. 복제 글(짧은 글·긴 글)에는 `license`와 `credit`을 함께 적고, 직접 작성한 글은 `license: "original"`과 `credit: null`을 쓴다. 출처 메타데이터가 불완전한 자료는 앱이 읽지 않는다.
3. 발췌문은 제목에 `(발췌)`를 붙이고, 그림 캡션·각주·목록 기호·HTML 엔티티 같은 추출 잔여물을 제거한다. 복제 글은 완결된 문장으로 끝낸다.
4. `npm run text-licenses:update`로 이 문서를 다시 생성한다.
5. `npm run test`와 `npm run build`를 실행한다. `src/content/textLicenseInventory.test.ts`가 이 문서와 애셋의 개수·제목·라이선스·저자·출처·URL이 일치하는지 검사하고, 기존 콘텐츠 테스트가 길이·문장 종료·출처 필수 규칙을 확인한다.

## 검증과 수정

- 검증: `npm run test`에 포함된 `src/content/textLicenseInventory.test.ts`가 `TEXT-LICENSES.md`를 현재 애셋에서 다시 만든 내용과 비교한다. 문서가 오래되면 테스트가 실패한다.
- 수정: `npm run text-licenses:update`가 같은 모듈로 문서를 다시 쓴다. 손으로 표를 고치지 않는다.
- 한 줄 연습의 출처 표기는 `TextLesson`의 `source`·`credit`을, 글 연습의 출처 표기는 `passageActivities`의 `license`·`credit`을 그대로 사용하므로, 애셋이 이 문서의 원본이다.
