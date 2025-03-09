import chatStyles from "@/app/components/chat.module.scss";
import styles from "@/app/components/deep-searcher/deep-searcher.module.scss";
import homeStyles from "@/app/components/home.module.scss";

import { IconButton } from "@/app/components/button";
import ReturnIcon from "@/app/icons/return.svg";
import Locale from "@/app/locales";
import { Path } from "@/app/constant";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  copyToClipboard,
  getMessageTextContent,
  useMobileScreen,
} from "@/app/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppConfig } from "@/app/store";
import MinIcon from "@/app/icons/min.svg";
import MaxIcon from "@/app/icons/max.svg";
import { getClientConfig } from "@/app/config/client";
import { ChatAction } from "@/app/components/chat";
import DeleteIcon from "@/app/icons/clear.svg";
import CopyIcon from "@/app/icons/copy.svg";
import PromptIcon from "@/app/icons/prompt.svg";
import ResetIcon from "@/app/icons/reload.svg";
import { useDeepSearcherStore } from "@/app/store/deep-searcher";
import LoadingIcon from "@/app/icons/three-dots.svg";
import ErrorIcon from "@/app/icons/delete.svg";
import SuccessIcon from "@/app/icons/confirm.svg";
import SDIcon from "@/app/icons/sd.svg";
import { Property } from "csstype";
import { showConfirm, showModal } from "@/app/components/ui-lib";
import { removeImage } from "@/app/utils/chat";
import { SideBar } from "./deep-searcher-sidebar";
import { WindowContent } from "@/app/components/home";
import { params } from "./deep-searcher-panel";
import clsx from "clsx";

function getSdTaskStatus(item: any) {
  let s: string;
  let color: Property.Color | undefined = undefined;
  switch (item.status) {
    case "success":
      s = Locale.DeepSearcher.Status.Success;
      color = "green";
      break;
    case "error":
      s = Locale.DeepSearcher.Status.Error;
      color = "red";
      break;
    case "wait":
      s = Locale.DeepSearcher.Status.Wait;
      color = "yellow";
      break;
    case "running":
      s = Locale.DeepSearcher.Status.Running;
      color = "blue";
      break;
    default:
      s = item.status.toUpperCase();
  }
  return (
    <p className={styles["line-1"]} title={item.error} style={{ color: color }}>
      <span>
        {Locale.DeepSearcher.Status.Name}: {s}
      </span>
      {item.status === "error" && (
        <span
          className="clickable"
          onClick={() => {
            showModal({
              title: Locale.DeepSearcher.Detail,
              children: (
                <div style={{ color: color, userSelect: "text" }}>
                  {item.error}
                </div>
              ),
            });
          }}
        >
          - {item.error}
        </span>
      )}
    </p>
  );
}

export function Sd() {
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  const location = useLocation();
  const clientConfig = useMemo(() => getClientConfig(), []);
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;
  const config = useAppConfig();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sdStore = useDeepSearcherStore();
  const [sdImages, setSdImages] = useState(sdStore.draw);
  const isSd = location.pathname === Path.DeepSearcher;

  useEffect(() => {
    setSdImages(sdStore.draw);
  }, [sdStore.currentId]);

  return (
    <>
      <SideBar className={clsx({ [homeStyles["sidebar-show"]]: isSd })} />
      <WindowContent>
        <div className={chatStyles.chat} key={"1"}>
          <div className="window-header" data-tauri-drag-region>
            {isMobileScreen && (
              <div className="window-actions">
                <div className={"window-action-button"}>
                  <IconButton
                    icon={<ReturnIcon />}
                    bordered
                    title={Locale.Chat.Actions.ChatList}
                    onClick={() => navigate(Path.DeepSearcher)}
                  />
                </div>
              </div>
            )}
            <div
              className={clsx(
                "window-header-title",
                chatStyles["chat-body-title"],
              )}
            >
              <div className={`window-header-main-title`}>Deep Searcher</div>
              <div className="window-header-sub-title">
                {Locale.DeepSearcher.SubTitle(sdImages.length || 0)}
              </div>
            </div>

            <div className="window-actions">
              {showMaxIcon && (
                <div className="window-action-button">
                  <IconButton
                    aria={Locale.Chat.Actions.FullScreen}
                    icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                    bordered
                    onClick={() => {
                      config.update(
                        (config) => (config.tightBorder = !config.tightBorder),
                      );
                    }}
                  />
                </div>
              )}
              {isMobileScreen && <SDIcon width={50} height={50} />}
            </div>
          </div>
          <div className={chatStyles["chat-body"]} ref={scrollRef}>
            <div className={styles["sd-img-list"]}>
              {sdImages.length > 0 ? (
                sdImages.map((item: any) => {
                  return (
                    <div
                      key={item.id}
                      style={{ display: "flex" }}
                      className={styles["sd-img-item"]}
                    >
                      {item.status === "success" ? (
                        <div className={styles["pre-img"]}>
                          <SuccessIcon />
                        </div>
                      ) : item.status === "error" ? (
                        <div className={styles["pre-img"]}>
                          <ErrorIcon />
                        </div>
                      ) : (
                        <div className={styles["pre-img"]}>
                          <LoadingIcon />
                        </div>
                      )}
                      <div
                        style={{ marginLeft: "10px" }}
                        className={styles["sd-img-item-info"]}
                      >
                        {item.status === "success" ? (
                          <p className={styles["line-content"]}>
                            {item.img_data}
                          </p>
                        ) : (
                          <p></p>
                        )}
                        <p className={styles["line-1"]}>
                          {Locale.DeepSearcherPanel.Prompt}:{" "}
                          <span
                            className="clickable"
                            title={item.params.prompt}
                            onClick={() => {
                              showModal({
                                title: Locale.DeepSearcher.Detail,
                                children: (
                                  <div style={{ userSelect: "text" }}>
                                    {item.params.prompt}
                                  </div>
                                ),
                              });
                            }}
                          >
                            {item.params.prompt}
                          </span>
                        </p>
                        <p>
                          {"Action"}: {item.model_name}
                        </p>
                        {getSdTaskStatus(item)}
                        <p>{item.created_at}</p>
                        <div className={chatStyles["chat-message-actions"]}>
                          <div
                            className={chatStyles["chat-input-actions"]}
                            style={{ justifyContent: "normal" }}
                          >
                            <ChatAction
                              text={Locale.DeepSearcher.Actions.Params}
                              icon={<PromptIcon />}
                              onClick={() => {
                                showModal({
                                  title: Locale.DeepSearcher.GenerateParams,
                                  children: (
                                    <div style={{ userSelect: "text" }}>
                                      {Object.keys(item.params).map((key) => {
                                        let label = key;
                                        let value = item.params[key];
                                        switch (label) {
                                          case "prompt":
                                            label =
                                              Locale.DeepSearcherPanel.Prompt;
                                            break;
                                          case "negative_prompt":
                                            label =
                                              Locale.DeepSearcherPanel
                                                .NegativePrompt;
                                            break;
                                          case "aspect_ratio":
                                            label =
                                              Locale.DeepSearcherPanel
                                                .AspectRatio;
                                            break;
                                          case "seed":
                                            label = "Seed";
                                            value = value || 0;
                                            break;
                                          case "output_format":
                                            label =
                                              Locale.DeepSearcherPanel
                                                .OutFormat;
                                            value = value?.toUpperCase();
                                            break;
                                          case "style":
                                            label =
                                              Locale.DeepSearcherPanel
                                                .ImageStyle;
                                            value = params
                                              .find(
                                                (item) =>
                                                  item.value === "style",
                                              )
                                              ?.options?.find(
                                                (item) => item.value === value,
                                              )?.name;
                                            break;
                                          default:
                                            break;
                                        }

                                        return (
                                          <div
                                            key={key}
                                            style={{ margin: "10px" }}
                                          >
                                            <strong>{label}: </strong>
                                            {value}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ),
                                });
                              }}
                            />
                            <ChatAction
                              text={Locale.DeepSearcher.Actions.Copy}
                              icon={<CopyIcon />}
                              onClick={() =>
                                copyToClipboard(
                                  getMessageTextContent({
                                    role: "user",
                                    content: item.params.prompt,
                                  }),
                                )
                              }
                            />
                            <ChatAction
                              text={Locale.DeepSearcher.Actions.Retry}
                              icon={<ResetIcon />}
                              onClick={() => {
                                const reqData = {
                                  model: item.model,
                                  model_name: item.model_name,
                                  status: "wait",
                                  params: { ...item.params },
                                  created_at: new Date().toLocaleString(),
                                  img_data: "",
                                };
                                sdStore.sendTask(reqData);
                              }}
                            />
                            <ChatAction
                              text={Locale.DeepSearcher.Actions.Delete}
                              icon={<DeleteIcon />}
                              onClick={async () => {
                                if (
                                  await showConfirm(
                                    Locale.DeepSearcher.Danger.Delete,
                                  )
                                ) {
                                  // remove img_data + remove item in list
                                  removeImage(item.img_data).finally(() => {
                                    sdStore.draw = sdImages.filter(
                                      (i: any) => i.id !== item.id,
                                    );
                                    sdStore.getNextId();
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>{Locale.DeepSearcher.EmptyRecord}</div>
              )}
            </div>
          </div>
        </div>
      </WindowContent>
    </>
  );
}
