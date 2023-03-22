/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FcCheckmark } from "react-icons/fc";

import { useDaumPostcodePopup } from "react-daum-postcode";

import { emailCheck } from "../../utils/regexCheck";

export default function Signup_() {
  const [verifyNumber, setVerifyNumber] = useState(0);
  const [isGetVerifyButtonClick, setIsGetVerifyButtonClick] = useState(false);
  const [isVerify, setIsVerify] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    setValue,
    setError,
    getValues,
    clearErrors,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm();

  // const { onChange, onBlur, name, ref } = register('firstName');

  const onSubmit = async (data) => {
    console.log(data);
    if (!isVerify) {
      setError("inputVerifyNum", {
        type: "invalid verify email",
        message: "인증번호를 받아 이메일을 인증해주세요",
      });
      return;
    }
    try {
      const req = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const isSignup = req.json();
      if (isSignup) {
        navigate("/signup/category");
      }
    } catch (err) {
      alert(err);
    }
  };

  const open = useDaumPostcodePopup();
  const POPUPWIDTH = 500;
  const POPUPHEIGHT = 400;
  const handleComplete = (data) => {
    // 향후 매칭에 활용 될 시군 데이터
    console.log(data.sigungu);
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
    setValue("address", fullAddress);
    clearErrors("address");
  };

  const onAddressClick = () => {
    open({
      onComplete: handleComplete,
      width: POPUPWIDTH,
      height: POPUPHEIGHT,
      left: document.body.offsetWidth / 2 - POPUPWIDTH / 2,
      top: window.screen.height / 2 - POPUPHEIGHT / 2,
    });
  };

  const onEmailVerifyClick = async () => {
    const email = getValues("email");
    if (emailCheck(email)) {
      try {
        const req = await fetch("/api/signup/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const isValid = await req.json();
        console.log(isValid);
        setVerifyNumber(isValid?.authNumber);
        setIsGetVerifyButtonClick(true);
        clearErrors("email");
      } catch (err) {
        console.log(err);
      }
    } else {
      setError("email", {
        type: "email invalid",
        message: "유효한 이메일 형식이 아닙니다.",
      });
    }
  };

  const onVerifyClick = () => {
    if (isVerify) return;
    console.log("인증번호 확인 버튼 누름");
    const inputValue = Number(getValues("inputVerifyNum"));
    if (inputValue !== verifyNumber) {
      setError("inputVerifyNum", {
        type: "invalid verify number",
        message: "인증번호가 일치하지 않습니다.",
      });
    } else {
      clearErrors("inputVerifyNum");
      setIsVerify(true);
      alert("인증번호가 일치합니다.");
    }
  };

  return (
    <Container>
      <h2>회원가입</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          placeholder="별명"
          css={errors?.nickname && inputError}
          {...register("nickname", {
            required: "닉네임을 입력해주세요.",
            minLength: {
              value: 2,
              message: "2자 이상 입력해주세요.",
            },
          })}
        />
        {errors?.nickname && (
          <FormErrorMessage>{errors?.nickname?.message}</FormErrorMessage>
        )}
        <ButtonForm>
          <ButtonFormInput
            type="text"
            placeholder="ID(이메일)"
            css={errors?.email && inputError}
            {...register("email", {
              required: "이메일을 입력해주세요.",
              pattern: {
                value: /\w{4,}@\w{2,}\.\w{2,}/g,
                message: "유효한 이메일 형식이 아닙니다.",
              },
            })}
          />
          <ButtonFormSubmit type="button" onClick={onEmailVerifyClick}>
            인증번호
            <br />
            받기
          </ButtonFormSubmit>
        </ButtonForm>
        {errors?.email && (
          <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
        )}
        {isGetVerifyButtonClick && (
          <ButtonForm>
            <ButtonFormInput
              type="text"
              placeholder="인증번호"
              css={errors?.inputVerifyNum && inputError}
              {...register("inputVerifyNum", {
                required: "인증번호를 입력해주세요",
              })}
            />
            <ButtonFormSubmit
              type="button"
              onClick={onVerifyClick}
              css={
                isVerify &&
                css`
                  background-color: #ccc;
                  border: 1px solid #000;
                  cursor: default;
                `
              }
            >
              {isVerify ? (
                <FcCheckmark />
              ) : (
                <span>
                  인증번호
                  <br />
                  확인
                </span>
              )}
            </ButtonFormSubmit>
          </ButtonForm>
        )}
        {errors?.inputVerifyNum && (
          <FormErrorMessage>{errors?.inputVerifyNum?.message}</FormErrorMessage>
        )}
        <Input
          type="password"
          placeholder="비밀번호"
          css={errors?.password && inputError}
          {...register("password", {
            required: "비밀번호를 입력해주세요.",
            minLength: {
              value: 6,
              message: "6자 이상 입력해주세요.",
            },
          })}
        />
        {errors?.password && (
          <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
        )}
        <Input
          type="password"
          placeholder="비밀번호 확인"
          css={errors?.confirmPassword && inputError}
          {...register("confirmPassword", {
            required: "동일한 비밀번호를 입력해주세요.",
            validate: (value, formValues) =>
              value === getValues("password") ||
              "비밀번호가 일치하지 않습니다.",
          })}
        />
        {errors?.confirmPassword && (
          <FormErrorMessage>
            {errors?.confirmPassword?.message}
          </FormErrorMessage>
        )}
        <ButtonForm>
          <ButtonFormInput
            type="text"
            placeholder="주소"
            css={errors?.address && inputError}
            readOnly
            {...register("address", {
              required: "주소지를 입력해주세요.",
            })}
          />
          <ButtonFormSubmit type="button" onClick={onAddressClick}>
            주소
            <br />
            찾기
          </ButtonFormSubmit>
        </ButtonForm>
        {errors?.address && (
          <FormErrorMessage>{errors?.address?.message}</FormErrorMessage>
        )}
        <Input
          type="text"
          placeholder="상세주소"
          {...register("detail_address")}
        />
        <button type="submit" disabled={isSubmitting}>
          회원가입
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          css={css`
            background-color: gray;
          `}
        >
          뒤로가기
        </button>
      </Form>
    </Container>
  );
}

const inputError = css`
  border: 2px solid red;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 50px 0;
  gap: 20px;
`;
const Form = styled.form`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const Input = styled.input`
  outline: none;
`;
const FormErrorMessage = styled.p`
  font-size: 10px;
  color: red;
  text-align: left;
  margin: -10px 0 0 0;
`;
const ButtonForm = styled.div`
  display: flex;
  gap: 10px;
`;
const ButtonFormInput = styled.input`
  width: calc(80% - 5px);
  outline: none;
`;
const ButtonFormSubmit = styled.button`
  width: calc(20% - 5px);
  transition: all 0.2s linear;
  font-size: 12px;
`;
