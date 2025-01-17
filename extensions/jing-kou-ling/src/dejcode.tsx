import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function DeCode() {
  const {
    state,
    decode,
  }: { state: { result: IDcodeResult; isLoading: boolean }; decode: (encodeText: string) => Promise<Toast | void> } =
    useDecode();
  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={decode}
      searchBarPlaceholder="Paste the JD code that needs to be parse"
      throttle
    >
      <List.Section title="parsed">
        {(Object.keys(state.result) as Array<keyof IDcodeResult>).map(<K extends keyof IDcodeResult>(key: K) => (
          <DecodeItem key={key} title={key} value={state.result[key]} />
        ))}
      </List.Section>
    </List>
  );
}

function DecodeItem({ title, value }: { title: string; value: string | number | undefined }) {
  return (
    <List.Item
      title={title}
      subtitle={`${value}`}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy to clipboard" content={`${value}`} />
        </ActionPanel>
      }
    />
  );
}

function useDecode() {
  const [state, setState] = useState({ result: {}, isLoading: false });
  const cancelRef = useRef<AbortController | null>(null);
  async function decode(encodeText: string): Promise<void | Toast> {
    cancelRef.current?.abort();
    cancelRef.current = new AbortController();
    setState((oldState) => ({
      ...oldState,
      isLoading: true,
    }));
    try {
      const { data } = await axios.post("https://api.jds.codes/jd/jcommand", { code: encodeText });
      if (data.code === 200 && data.data) {
        setState({ result: data.data, isLoading: false });
      } else {
        setState({ result: {}, isLoading: false });
        return showToast({ style: Toast.Style.Failure, title: data.msg });
      }
    } catch (error) {
      setState({ result: {}, isLoading: false });
      return showToast({ style: Toast.Style.Failure, title: "something wrong was happend" });
    }
  }
  useEffect(() => {
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return {
    state,
    decode,
  };
}

interface IDcodeResult {
  img?: string;
  headImg?: string;
  title?: string;
  userName?: string;
  jumpUrl?: string;
}
