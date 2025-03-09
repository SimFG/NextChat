import { IconButton } from "@/app/components/button";
import GithubIcon from "@/app/icons/github.svg";
import SDIcon from "@/app/icons/sd.svg";
import ReturnIcon from "@/app/icons/return.svg";
import HistoryIcon from "@/app/icons/history.svg";
import Locale from "@/app/locales";
import homeStyles from "@/app/components/home.module.scss";

import { Path, DEEPSEARCHER_REPO_URL, ZILLIZ_CLOUD } from "@/app/constant";

import { useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";
import {
  SideBarContainer,
  SideBarBody,
  SideBarHeader,
  SideBarTail,
  useDragSideBar,
  useHotKey,
} from "@/app/components/sidebar";

import { getParams, getModelParamBasicData } from "./deep-searcher-panel";
import { useDeepSearcherStore } from "@/app/store/deep-searcher";
import { showToast } from "@/app/components/ui-lib";
import { useMobileScreen } from "@/app/utils";

const SdPanel = dynamic(
  async () => (await import("@/app/components/deep-searcher")).SdPanel,
  {
    loading: () => null,
  },
);

export function SideBar(props: { className?: string }) {
  useHotKey();
  const isMobileScreen = useMobileScreen();
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const sdStore = useDeepSearcherStore();
  const currentModel = sdStore.currentModel;
  const params = sdStore.currentParams;
  const setParams = sdStore.setCurrentParams;

  const handleSubmit = () => {
    const columns = getParams?.(currentModel, params);
    const reqParams: any = {};
    for (let i = 0; i < columns.length; i++) {
      const item = columns[i];
      reqParams[item.value] = params[item.value] ?? null;
      if (item.required) {
        if (!reqParams[item.value]) {
          showToast(Locale.DeepSearcherPanel.ParamIsRequired(item.name));
          return;
        }
      }
    }
    if (currentModel.value != "search_action") {
      try {
        JSON.parse(reqParams["config"]);
      } catch (error) {
        showToast("config is not a valid JSON string");
        return;
      }
    }
    let data: any = {
      model: currentModel.value,
      model_name: currentModel.name,
      status: "wait",
      params: reqParams,
      created_at: new Date().toLocaleString(),
      img_data: "",
    };
    sdStore.sendTask(data, () => {
      setParams(getModelParamBasicData(columns, params, true));
      navigate(Path.DeepSearcher);
    });
  };

  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      {isMobileScreen ? (
        <div
          className="window-header"
          data-tauri-drag-region
          style={{
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<ReturnIcon />}
                bordered
                title={Locale.DeepSearcher.Actions.ReturnHome}
                onClick={() => navigate(Path.Home)}
              />
            </div>
          </div>
          <SDIcon width={50} height={50} />
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<HistoryIcon />}
                bordered
                title={Locale.DeepSearcher.Actions.History}
                onClick={() => navigate(Path.SdNew)}
              />
            </div>
          </div>
        </div>
      ) : (
        <SideBarHeader
          title={
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.DeepSearcher.Actions.ReturnHome}
              onClick={() => navigate(Path.Home)}
            />
          }
          logo={<SDIcon width={38} height={"100%"} />}
        ></SideBarHeader>
      )}
      <SideBarBody>
        <SdPanel />
      </SideBarBody>
      <SideBarTail
        primaryAction={
          <>
            {/* TODO fubang change icon */}
            <div className={homeStyles["sidebar-action"]}>
              <a href={ZILLIZ_CLOUD} target="_blank" rel="noopener noreferrer">
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>
            <div className={homeStyles["sidebar-action"]}>
              <a
                href={DEEPSEARCHER_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>
          </>
        }
        secondaryAction={
          <IconButton
            text={Locale.DeepSearcherPanel.Submit}
            type="primary"
            shadow
            onClick={handleSubmit}
          ></IconButton>
        }
      />
    </SideBarContainer>
  );
}
