import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// apply bootstrap 5 theme
import "bootstrap/dist/css/bootstrap.min.css";

// 부트스트랩 적용 이전 내 스타일로 우선 적용
// 부트스트랩 css 아래에 적용해서 내 스타일 적용 가능함
import "./MyCalendar.css";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function MyCalendar(props) {
  const [showModal, setShowModal] = useState(false);
  const [showDayoffCancelModal, setShowDayoffcancelModel] = useState(false);
  const [dateString, setDateString] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [name, setName] = useState("");

  // 캘린더 레퍼런스 잡기
  const calRef = useRef();

  const handleCloseModal = () => setShowModal(false);
  const handleDayoffCloseModal = () => setShowDayoffcancelModel(false);
  const handleShowModal = () => setShowModal(true);
  const handleShowDayoffCancelModal = () => setShowDayoffcancelModel(true);

  // // 달력의 첫번째 날짜와 마지막 날짜 구하기
  // const getStartAndEndDate = () => {
  //   const calApi = calRef.current.getApi();
  //   const startDate = calApi.view.activeStart.toISOString().slice(0, 10);
  //   const endDate = calApi.view.activeEnd.toISOString().slice(0, 10);
  //   const viewDateRange = {
  //     startDate: startDate,
  //     endDate: endDate,
  //   };
  //   return viewDateRange;
  // };

  // const requestDayoffSchedule = async () => {
  //   const dateRange = JSON.stringify(getStartAndEndDate());
  //   const resp = await fetch(`/dayoff?range=${dateRange}`, {
  //     method: "GET",
  //   });

  //   const data = await resp.json();
  //   const dayoffSchedule = data.dayoffSchedule;
  //   console.log(`dayoff schedule length : ${dayoffSchedule}`);
  // };

  // 페이지 로딩되면 곧바로 화면에 표시된 달력에 휴무스케쥴 서버에서 불러오기
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken !== null) setAccessToken(accessToken);

    const nameFromServer = localStorage.getItem("name");
    setName(nameFromServer);
  }, []);

  const dateHeaderFormat = {
    weekday: "short",
    // day: "numeric",
  };

  const headerToolbarSetting = { start: "prev", center: "title", end: "next" };

  // 휴무신청 버튼 띄우기
  // const renderDaycellContent = () => {
  //   return (
  //     <>
  //       <Button variant="primary" onClick={handleShowModal}>
  //         휴무신청
  //       </Button>
  //     </>
  //   );
  // };

  // 페이지 리프레시
  const refreshPage = () => {
    window.location.reload(false);
  };

  // 휴무신청 버튼 누르면 동작
  const fillInDayoff = async () => {
    // console.log(`fillInDayoff에서 확인한 accessToken : ${accessToken}`);
    if (accessToken.length === 0) {
      props.onFormSwitch("login");
    }

    // POST 요청
    const resp = await fetch("/dayoff", {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      // header에 content-type 이 application/json 일때는 body 내용에
      // string 형식으로 dictionary 를 넣어줘야 서버에서 읽힌다.
      body: JSON.stringify({
        id: new Date().toLocaleString(),
        title: name,
        start: dateString,
      }),
    });

    const data = await resp.json();
    // 액세스토큰 인증 유효 검사
    if (data.result === "ok") {
      alert(data.message);
      handleCloseModal();
      refreshPage();
    } else if (data.result === "error") {
      alert(data.message);
      props.onFormSwitch("login");
    } else if (data.result === "alreadyFilled") {
      alert(data.message);
      handleCloseModal();
    }

    // console.info(data);
    // handleCloseModal();
    // refreshPage();
  };

  // 날짜를 누르면 휴무신청 모달 띄우기
  const handleDateClickEvent = (eventInfo) => {
    const date = eventInfo.dateStr;
    setDateString(date);
    handleShowModal();
  };

  // 휴무=event를 화면에 렌더링
  const renderEventContent = (eventInfo) => {
    return (
      <>
        <p id="dayoffTitleName">{eventInfo.event.title}</p>
      </>
    );
  };

  // event=휴무 를 클릭하면 휴무 취소 모달 띄우기
  const eventClickHandler = (eventInfo) => {
    // const startDate = eventInfo.event.start;
    const clickedEventDate = eventInfo.event.start;
    const dateCompensation = new Date(
      clickedEventDate.getTime() +
        Math.abs(clickedEventDate.getTimezoneOffset() * 60000)
    );
    const offsetCompensatedDate = dateCompensation.toISOString().slice(0, 10);

    // const koDate = eventInfo.event.start.toLocaleString();
    setDateString(offsetCompensatedDate);
    handleShowDayoffCancelModal();
  };

  // 휴무취소 실행
  const cancelDayoff = async () => {
    // let calApi = calRef.current.getApi();
    // let events = calApi.getEvents();
    // let event = calApi.getEventById(idString);
    // console.log(events);

    // console.log(`fillInDayoff에서 확인한 accessToken : ${accessToken}`);
    if (accessToken.length === 0) {
      props.onFormSwitch("login");
    }

    // DELETE 요청
    const resp = await fetch("/dayoff", {
      method: "DELETE",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      // header에 content-type 이 application/json 일때는 body 내용에
      // string 형식으로 dictionary 를 넣어줘야 서버에서 읽힌다.
      body: JSON.stringify({
        title: name,
        start: dateString,
      }),
    });

    const data = await resp.json();
    // 액세스토큰 인증 유효 검사
    if (data.result === "ok") {
      alert(data.message);
      refreshPage();
    } else if (data.result === "error") {
      alert(data.message);
      props.onFormSwitch("login");
    }

    handleDayoffCloseModal();
  };

  return (
    <>
      {/* 휴무확인 모달 영역 시작 */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>휴무신청</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{dateString}일에 휴무를 신청하시겠습니까?</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            아니요
          </Button>
          <Button variant="primary" onClick={fillInDayoff}>
            휴무신청
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 휴무확인 모달 영역 끝 */}

      {/* 휴무취소 확인 모달 영역 시작 */}
      <Modal show={showDayoffCancelModal} onHide={handleDayoffCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>휴무취소</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{dateString}일에 등록된 휴무를 취소하시겠습니까?</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleDayoffCloseModal}>
            아니요
          </Button>
          <Button variant="primary" onClick={cancelDayoff}>
            휴무취소
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 휴무취소 확인 모달 영역 끝 */}

      {/* 휴무수정 확인 모달 영역 시작 */}
      
      {/* 휴무수정 확인 모달 영역 끝 */}

      <div className="mypage-body">
        <p id="header">형제물류 휴무관리</p>
        <div className="body-wrapper box">
          <div className="body-info-container">
            <div className="calendar-wrapper">
              <FullCalendar
                locale="ko"
                plugins={[dayGridPlugin, interactionPlugin]}
                editable="true"
                // eventDragStart={(info) => {
                //   console.log(info);
                // }}
                eventDrop={(eventDropInfo) => {
                  // console.log(eventDropInfo);
                  const name = eventDropInfo.event._def.title;
                  const oldDateString = eventDropInfo.oldEvent.startStr;
                  const newDateString = eventDropInfo.event.startStr;
                  console.log(
                    `name: ${name}, oldDate : ${oldDateString}, newDate : ${newDateString}`
                  );
                }}
                initialView="dayGrid"
                duration={{ weeks: 3 }}
                headerToolbar={headerToolbarSetting}
                height={"100%"}
                // contentHeight="640px"
                dateClick={handleDateClickEvent}
                // dayCellContent={renderDaycellContent}
                dayHeaderFormat={dateHeaderFormat}
                eventAdd
                events={"/dayoff"}
                eventSourceFailure={(err) => {
                  console.log(`이벤트 받아오기 실패 : ${err}`);
                }}
                eventContent={renderEventContent}
                eventClick={eventClickHandler}
                ref={calRef}
              />
            </div>
            <b className="dayoff_guide">
              <br></br>* 날짜를 클릭하여 휴무를 신청하세요.
              <br></br>* 취소는 본인 이름을 클릭하세요.
            </b>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyCalendar;