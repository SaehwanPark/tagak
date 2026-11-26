# 연습문 출처와 라이선스

이 문서는 앱이 실제로 읽는 연습문의 출처와 라이선스 정보를 한곳에 모은 것이다. 한 줄 출처 표기와 글 고르기 목록이 같은 애셋 메타데이터를 사용하도록, 이 파일은 `src/content`의 콘텐츠 모듈에서 자동 생성한다.

> 일부 한 줄 ID는 기존 로컬 기록의 호환성을 위해 이전 이름을 유지한다. 현재 문장과 출처 유형은 표의 내용과 애셋 메타데이터를 기준으로 하며, ID 자체는 외부 출처나 라이선스를 뜻하지 않는다.

> 이 파일은 직접 고치지 않는다. 애셋을 바꾼 뒤 `npm run text-licenses:update`로 다시 생성하고, `npm run test`로 애셋 메타데이터와의 일치를 확인한다.

## 요약

| 자료 묶음 | 개수 | 출처 유형·라이선스 | 애셋 |
| --- | --- | --- | --- |
| 한국어 한 줄 | 100 | 직접 작성 48 · 격언·속담 52 | `src/content/assets/one-line.ko.json` |
| 영어 한 줄 | 100 | 직접 작성 43 · 격언·속담 57 | `src/content/assets/one-line.en.json` |
| 30초 낱말 도전 | 28 | 직접 작성 | `src/content/assets/challenge-words.json` |
| 한국어 짧은 글 | 36 | 직접 작성 14 · CC BY-SA 4.0 21 · 퍼블릭 도메인 1 | `src/content/assets/passages.ko.json` |
| 한국어 긴 글 | 9 | 직접 작성 2 · CC BY-SA 4.0 7 · 퍼블릭 도메인 0 | `src/content/assets/passages.ko.json` |
| 영어 짧은 글 | 16 | 직접 작성 5 · CC BY-SA 4.0 11 | `src/content/assets/passages.en.json` |
| 영어 긴 글 | 7 | 직접 작성 1 · CC BY-SA 4.0 6 | `src/content/assets/passages.en.json` |
| **글 전체** | **68** | 직접 작성 22 · 복제 46 | `src/content/assets/passages.*.json` |

## 라이선스 표기

- **직접 작성**: 한 줄의 직접 작성 문장과 도전 낱말은 타각에서 새로 썼다. 출처 표기만으로 현대 작품 문장을 사용할 권리를 얻지는 않으므로, 별도 이용 허가가 확인되지 않은 영화·게임·애니메이션 대사는 포함하지 않는다.
- **격언·속담**: 널리 전해지는 짧은 표현이다. 애셋에 참고한 사전·자료의 저자·출처·HTTPS URL을 기록하고 연습 화면에 표시한다.
- **CC BY-SA 4.0**: 위키문헌·위키백과에서 발췌한 글은 저자·제목·원문 URL과 [라이선스](https://creativecommons.org/licenses/by-sa/4.0/)를 함께 표시한다. 글은 발췌했고 연습용 문단·화면 줄바꿈을 적용했다. 배포 시 같은 라이선스 조건을 유지하며, 원저자가 타각을 후원·승인한다는 뜻은 아니다. 자세한 표기는 아래 글 목록과 오프라인 `THIRD-PARTY-NOTICES.html`에 있다.
- **퍼블릭 도메인**: 저작권 보호 기간이 끝났거나 법령에 따라 보호받지 않는 자료다. 현재는 저작권법 제7조 제1호에 열거된 대한민국헌법에서 발췌했고, 애셋에는 출처와 [법령 근거](https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029423769)를 함께 남긴다.

## 한 줄 연습

### 한국어 (100)

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
| `ko-quote-slamdunk-give-up` | 꾸준한 연습 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-one-piece` | 다음 한 걸음 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-pokemon` | 따뜻한 응원 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-naruto` | 천천히 다음 글자 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-toy-story` | 한 걸음부터 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-zelda` | 여행 준비 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-skyrim` | 낯선 길 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-diablo` | 잠깐의 쉼 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-saying-proverb-01` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-02` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-03` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-04` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-06` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-09` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-10` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-12` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-14` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-16` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-17` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-18` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-19` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-23` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-25` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-26` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-28` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-29` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-proverb-31` | 한국 격언·속담 | 격언·속담 | 구전 | 위키낱말사전 · 한국어 속담 | [열기](https://ko.wiktionary.org/wiki/%EB%B6%84%EB%A5%98:%ED%95%9C%EA%B5%AD%EC%96%B4_%EC%86%8D%EB%8B%B4) |
| `ko-saying-descartes` | 한국 격언·속담 | 격언·속담 | 르네 데카르트 | 《방법서설》 | [열기](https://en.wikipedia.org/wiki/Cogito,_ergo_sum) |
| `ko-saying-hippocrates` | 한국 격언·속담 | 격언·속담 | 히포크라테스 | 《아포리즘》 | [열기](https://en.wikipedia.org/wiki/Hippocrates) |
| `ko-proverb-33` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-34` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-35` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-36` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-37` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-38` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-39` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-40` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-41` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-42` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-43` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-44` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-45` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-46` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-47` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-48` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-49` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-50` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-51` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-52` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-53` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-54` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-55` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-56` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-57` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-58` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-59` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-60` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-61` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-62` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-proverb-63` | 전승 속담 | 격언·속담 | 국립국어원 | 한국어교육 어휘 내용 개발 2단계 | [열기](https://www.korean.go.kr/common/download.do?book_seq=268&c_file_name=9d14b893-1074-464c-8479-a9f58fdc9204_0.pdf&downGubun=bookDataView&file_path=bookData&o_file_name=%ED%95%9C%EA%B5%AD%EC%96%B4%EC%A7%84%ED%9D%A5-01-13.pdf) |
| `ko-quote-hong-gildong-01` | 오래 기다린 말 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-quote-hong-gildong-02` | 저녁의 이름 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-dawn-kitchen` | 새벽의 부엌 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-paper-boat` | 종이배의 항해 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-slow-walk` | 느린 산책 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-window-song` | 창문 사이의 노래 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-old-map` | 오래된 지도 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-last-bus` | 마지막 버스 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-short-pause` | 짧은 멈춤 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-rhythm` | 서로 다른 박자 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-waiting` | 기다림의 시간 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-rain-umbrella` | 비와 우산 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-daily-notes` | 하루의 기록 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-first-snow` | 첫눈의 길 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-early-arrival` | 먼저 도착한 아침 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-unspoken` | 말하지 않은 마음 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-new-leaf` | 화분의 새잎 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-bookshop` | 작은 서점 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-glass-of-water` | 따뜻한 물 한 잔 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-old-letter` | 먼 길을 온 편지 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-evening-street` | 저녁 골목 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-after-rain` | 비 갠 운동장 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-old-photo` | 오래된 사진 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-dinner-table` | 저녁 식탁 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-again` | 한 번 더 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-small-mistake` | 작은 실수 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-practice-note` | 연습 기록 | 직접 작성 | — | 타각 직접 작성 | — |
| `ko-original-new-name` | 처음 만난 이름 | 직접 작성 | — | 타각 직접 작성 | — |

### 영어 (100)

| ID | 연습문 | 출처 유형 | 저자·발화자 | 출처 | 원문 |
| --- | --- | --- | --- | --- | --- |
| `en-window` | Morning at the window | 직접 작성 | — | 타각 직접 작성 | — |
| `en-tea` | A quiet morning | 직접 작성 | — | 타각 직접 작성 | — |
| `en-lamp` | The last lamp | 직접 작성 | — | 타각 직접 작성 | — |
| `en-letter` | An old letter | 직접 작성 | — | 타각 직접 작성 | — |
| `en-train` | The night train | 직접 작성 | — | 타각 직접 작성 | — |
| `en-stars` | Counting stars | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-gone-with-the-wind` | A quiet room | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-casablanca` | The train | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-star-wars` | Evening walk | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-a-few-good-men` | A careful answer | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-sixth-sense` | Behind the curtain | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-jerry-maguire` | A kind word | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-dirty-dancing` | Learning the steps | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-jaws` | Beyond the harbor | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-toy-story` | Paper rocket | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-wizard-of-oz` | The road home | 직접 작성 | — | 타각 직접 작성 | — |
| `en-saying-proverb-01` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
| `en-saying-proverb-02` | English proverbs & sayings | 격언·속담 | Traditional | English proverb | [열기](https://en.wiktionary.org/wiki/Category:English_proverbs) |
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
| `en-saying-descartes` | English proverbs & sayings | 격언·속담 | René Descartes | Discourse on the Method | [열기](https://en.wikipedia.org/wiki/Cogito,_ergo_sum) |
| `en-saying-hippocrates` | English proverbs & sayings | 격언·속담 | Hippocrates | Aphorisms | [열기](https://en.wikipedia.org/wiki/Hippocrates) |
| `en-proverb-31` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-32` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-33` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-34` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-35` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-36` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-37` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-38` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-39` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-40` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-41` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-42` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-43` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-44` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-45` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-46` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-47` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-48` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-49` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-50` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-51` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-52` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-53` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-54` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-proverb-55` | English proverbs | 격언·속담 | Traditional English proverb | Oxford Dictionary of Proverbs | [열기](https://doi.org/10.1093/acref/9780198734901.001.0001) |
| `en-quote-hamlet-brevity` | Short notes | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-hamlet-joint` | Old clocks | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-alice-book` | Beside the chair | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-alice-puzzle` | A curious question | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-christmas-bless` | Winter kindness | 직접 작성 | — | 타각 직접 작성 | — |
| `en-quote-tale-times` | Another season | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-paper-boat` | A paper boat | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-slow-walk` | Slow walk | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-last-bus` | The last bus | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-short-pause` | A short pause | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-rhythm` | Different rhythms | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-waiting` | Waiting | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-rain-umbrella` | Rain on the umbrella | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-daily-notes` | Daily notes | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-first-snow` | Fresh snow | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-early-arrival` | Arriving early | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-unspoken` | Unspoken feelings | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-new-leaf` | A new leaf | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-bookshop` | A little bookshop | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-glass-of-water` | A warm glass of water | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-old-letter` | A letter from home | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-evening-street` | The evening street | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-after-rain` | After the rain | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-old-photo` | An old photograph | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-dinner-table` | The dinner table | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-again` | One more try | 직접 작성 | — | 타각 직접 작성 | — |
| `en-original-practice-note` | A practice note | 직접 작성 | — | 타각 직접 작성 | — |

## 30초 낱말 도전

모든 도전 낱말은 직접 작성한 원문이다.

총 28개: 바람, 새벽, 연못, 우산, 모래, 햇살, 노을, 고래, 구름, 별빛, 산책, 물결, 종이, 나무, 달빛, 여행, 편지, 창가, 정원, 계절, 바다, 숲길, 노래, 기억, 마음, 하늘, 빗소리, 등불

## 짧은 글

### 한국어 (36)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 변경 사항 | 원문 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dawn-river` | 새벽 강변 | life | 직접 작성 | — | 자체 제작 | — | — |
| `small-library` | 작은 도서관 | life | 직접 작성 | — | 자체 제작 | — | — |
| `bakery-alley` | 골목의 빵집 | life | 직접 작성 | — | 자체 제작 | — | — |
| `autumn-walk` | 가을 산책 | literature | 직접 작성 | — | 자체 제작 | — | — |
| `city-stars` | 도시에서 별을 보는 법 | nonfiction | 직접 작성 | — | 자체 제작 | — | — |
| `first-computer` | 첫 컴퓨터 | technology | 직접 작성 | — | 자체 제작 | — | — |
| `radio-repair` | 오래된 라디오 | technology | 직접 작성 | — | 자체 제작 | — | — |
| `night-market` | 밤 시장 | life | 직접 작성 | — | 자체 제작 | — | — |
| `sea-time` | 바다의 시간 | nonfiction | 직접 작성 | — | 자체 제작 | — | — |
| `cat-window` | 고양이와 창가 | literature | 직접 작성 | — | 자체 제작 | — | — |
| `station-morning` | 정거장의 아침 | subculture | 직접 작성 | — | 자체 제작 | — | — |
| `robot-gardener` | 로봇 정원사 | subculture | 직접 작성 | — | 자체 제작 | — | — |
| `fantasy-inn` | 여행자의 여관 | subculture | 직접 작성 | — | 자체 제작 | — | — |
| `moon-poem` | 달빛 아래 | literature | 직접 작성 | — | 자체 제작 | — | — |
| `unsworn-morning` | 운수 좋은 날 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 현진건 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/운수_좋은_날) |
| `typewriter-history` | 타자기의 역사 | technology | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/타자기) |
| `constitution-preamble` | 대한민국헌법 전문 | nonfiction | 퍼블릭 도메인 | 대한민국 | 한국어 위키문헌 | 발췌; 화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/대한민국헌법_(제10호)) |
| `hancom-typing-web` | 웹 기반 한컴 타자연습 | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/한컴_타자연습) |
| `angbuilgu` | 앙부일구 | technology | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%95%99%EB%B6%80%EC%9D%BC%EA%B5%AC) |
| `baettaragi` | 배따라기 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 김동인 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/배따라기) |
| `buckwheat` | 메밀꽃 필 무렵 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 이효석 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/메밀꽃_필_무렵) |
| `camellia` | 동백꽃 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 김유정 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/동백꽃) |
| `hangul-day` | 한글날 | life | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B8%80%EB%82%A0) |
| `hanok` | 한옥 | life | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%ED%95%9C%EC%98%A5) |
| `hunminjeongeum` | 훈민정음 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%ED%9B%88%EB%AF%BC%EC%A0%95%EC%9D%8C) |
| `jikji` | 직지심체요절 | technology | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%A7%81%EC%A7%80%EC%8B%AC%EC%B2%B4%EC%9A%94%EC%A0%88) |
| `kimchi` | 김치 | life | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EA%B9%80%EC%B9%98) |
| `ondol` | 온돌 | life | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%98%A8%EB%8F%8C) |
| `pansori` | 판소리 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%ED%8C%90%EC%86%8C%EB%A6%AC) |
| `rain-gauge` | 측우기 | technology | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%B8%A1%EC%9A%B0%EA%B8%B0) |
| `rhythm-game` | 리듬 게임 | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EB%A6%AC%EB%93%AC_%EA%B2%8C%EC%9E%84) |
| `spring-spring` | 봄봄 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 김유정 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/봄봄) |
| `talchum` | 탈춤 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%ED%83%88%EC%B6%A4) |
| `turtle-ship` | 거북선 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EA%B1%B0%EB%B6%81%EC%84%A0) |
| `webtoon` | 웹툰 | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%9B%B9%ED%88%B0) |
| `yi-sun-sin` | 이순신 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%9D%B4%EC%88%9C%EC%8B%A0) |

### 영어 (16)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 변경 사항 | 원문 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `rain-window` | The rain window | literature | 직접 작성 | — | 자체 제작 | — | — |
| `small-library-en` | The small library | life | 직접 작성 | — | 자체 제작 | — | — |
| `night-train-en` | The night train | literature | 직접 작성 | — | 자체 제작 | — | — |
| `signal-stars` | Signals from the night sky | nonfiction | 직접 작성 | — | 자체 제작 | — | — |
| `last-arcade` | The last arcade | subculture | 직접 작성 | — | 자체 제작 | — | — |
| `hangul-english` | Hangul | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Hangul) |
| `bicycle` | Bicycle | life | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Bicycle) |
| `coffee` | Coffee | life | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Coffee) |
| `jazz` | Jazz | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Jazz) |
| `joseon-en` | Joseon | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Joseon) |
| `qwerty` | QWERTY | technology | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/QWERTY) |
| `retrocomputing` | Retrocomputing | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Retrocomputing) |
| `seoul` | Seoul | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Seoul) |
| `steampunk` | Steampunk | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Steampunk) |
| `typewriter-en` | Typewriter | technology | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Typewriter) |
| `video-game` | Video game | subculture | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Wikipedia contributors | English Wikipedia | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikipedia.org/wiki/Video_game) |

## 긴 글

### 한국어 (9)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 변경 사항 | 원문 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `river-city` | 강과 도시 | nonfiction | 직접 작성 | — | 자체 제작 | — | — |
| `star-road` | 별길 여행자 | subculture | 직접 작성 | — | 자체 제작 | — | — |
| `wings-room` | 날개 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 이상 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/날개) |
| `hangul-story` | 한글의 이름과 창제 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/한글) |
| `flame-sonata` | 광염 소나타 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 김동인 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/광염_소나타) |
| `joseon` | 조선 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EC%A1%B0%EC%84%A0) |
| `provisional-government` | 대한민국 임시정부 | nonfiction | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 위키백과 기여자 | 한국어 위키백과 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD_%EC%9E%84%EC%8B%9C%EC%A0%95%EB%B6%80) |
| `ready-made-life` | 레디메이드 인생 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 채만식 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/레디메이드_인생) |
| `water-mill` | 물레방아 (발췌) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 나도향 | 한국어 위키문헌 | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://ko.wikisource.org/wiki/물레방아) |

### 영어 (7)

| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 변경 사항 | 원문 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `long-way-home` | The long way home | literature | 직접 작성 | — | 자체 제작 | — | — |
| `gift-of-the-magi` | The Gift of the Magi (excerpt) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | O. Henry | English Wikisource | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikisource.org/wiki/The_Four_Million/The_Gift_of_the_Magi) |
| `monkeys-paw` | The Monkey's Paw (excerpt) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | W. W. Jacobs | English Wikisource | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikisource.org/wiki/The_Lady_of_the_Barge/The_Monkey%27s_Paw) |
| `open-boat` | The Open Boat (excerpt) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Stephen Crane | English Wikisource | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikisource.org/wiki/The_Open_Boat) |
| `scandal-bohemia` | A Scandal in Bohemia (excerpt) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Arthur Conan Doyle | English Wikisource | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikisource.org/wiki/The_Adventures_of_Sherlock_Holmes_(1892,_US)/A_Scandal_in_Bohemia) |
| `tell-tale-heart` | The Tell-Tale Heart (excerpt) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Edgar Allan Poe | English Wikisource | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikisource.org/wiki/Mystery_Tales_of_Edgar_Allan_Poe/The_Tell-Tale_Heart) |
| `yellow-wallpaper` | The Yellow Wall Paper (excerpt) | literature | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Charlotte Perkins Gilman | English Wikisource | 발췌; 연습용 문단·화면 줄바꿈 | [열기](https://en.wikisource.org/wiki/The_Yellow_Wall_Paper) |

## 새 연습문을 추가할 때

1. 알맞은 애셋에 항목을 추가한다. 한 줄과 도전 낱말은 `src/content/assets/`의 JSON에 넣는다.
2. 직접 작성 한 줄은 `source: "original"`로 둔다. 전승 표현은 `source: "traditional"`과 참고 저자·출처·HTTPS URL을 담은 `credit`을 함께 기록한다. 현대 작품의 문장은 출처 표기만으로 넣지 않는다. 저작권이 명확한 복제 글(짧은 글·긴 글)에는 `license`와 `credit`을 함께 적고, 직접 작성한 글은 `license: "original"`과 `credit: null`을 쓴다. 출처 메타데이터가 불완전한 자료는 앱이 읽지 않는다.
3. 발췌문은 제목에 `(발췌)`를 붙이고, 그림 캡션·각주·목록 기호·HTML 엔티티 같은 추출 잔여물을 제거한다. 복제 글은 완결된 문장으로 끝낸다.
4. `npm run text-licenses:update`로 이 문서를 다시 생성한다.
5. `npm run test`와 `npm run build`를 실행한다. `src/content/textLicenseInventory.test.ts`가 이 문서와 애셋의 개수·제목·라이선스·저자·출처·URL이 일치하는지 검사하고, 기존 콘텐츠 테스트가 길이·문장 종료·출처 필수 규칙을 확인한다.

## 검증과 수정

- 검증: `npm run test`에 포함된 `src/content/textLicenseInventory.test.ts`가 `TEXT-LICENSES.md`를 현재 애셋에서 다시 만든 내용과 비교한다. 문서가 오래되면 테스트가 실패한다.
- 수정: `npm run text-licenses:update`가 같은 모듈로 문서를 다시 쓴다. 손으로 표를 고치지 않는다.
- 한 줄 연습의 출처 표기는 `TextLesson`의 `source`·`credit`을, 글 연습의 출처 표기는 `passageActivities`의 `license`·`credit`을 그대로 사용하므로, 애셋이 이 문서의 원본이다.
