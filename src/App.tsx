import React, { useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { randomInt } from "crypto";
const OBSERVER_CONFIG = {
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true,
};

function getCaretPosition() {
  const selection = window.getSelection();
  if (selection === null) return;
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    // 캐럿이 위치한 노드 및 그 위치
    const caretNode = range.startContainer; // 현재 캐럿이 위치한 노드
    const caretOffset = range.startOffset; // 캐럿이 노드에서 몇 번째 위치에 있는지

    console.log("Caret is in node:", caretNode);
    console.log("Caret offset in node:", caretOffset);

    // 해당 노드가 텍스트 노드인 경우
    if (caretNode.nodeType === Node.TEXT_NODE) {
      console.log(
        "Text will be inserted at position",
        caretOffset,
        "in the text node:",
        caretNode.textContent
      );
    } else {
      console.log(
        "Text will be inserted inside an element node:",
        caretNode.nodeName
      );
    }
  }
}

function App() {
  const [mutations, setMutations] = useState<string>("");
  const [domNodes, setDomNodes] = useState<string>("");
  const [caretPosition, setCaretPosition] = useState<number>(0);
  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gridTemplateColumns: "0.5fr 640px",
        }}
      >
        <div
          contentEditable
          style={{
            height: 270,
            padding: 32,
            margin: 32,
            gridColumn: "1 / span 2",
            gridRow: "1",
          }}
          ref={(node) => {
            if (node === null) return;
            const observer = new MutationObserver((mutationsList) => {
              // 변경 내역 처리
              const serializedMutations = mutationsList.map((mutation) => {
                const info = {
                  type: mutation.type,
                  target: mutation.target.nodeName,
                  addedNodes: Array.from(mutation.addedNodes).map(
                    (node) => node.nodeName
                  ),
                  removedNodes: Array.from(mutation.removedNodes).map(
                    (node) => node.nodeName
                  ),
                  previousSibling: mutation.previousSibling
                    ? mutation.previousSibling.nodeName
                    : null,
                  nextSibling: mutation.nextSibling
                    ? mutation.nextSibling.nodeName
                    : null,
                  attributeName: mutation.attributeName,
                  oldValue: mutation.oldValue,
                };
                return Object.fromEntries(
                  Object.entries(info).filter(([key, value]) => {
                    if (Array.isArray(value)) {
                      return value.length > 0;
                    }
                    return !!value;
                  })
                );
              });

              // JSON으로 직렬화
              const jsonString = JSON.stringify(serializedMutations, null, 2);
              setMutations(jsonString);

              const innerHTML = node.innerHTML
                .replaceAll("<", "\n<")
                .replaceAll(">", ">\n");
              setDomNodes(innerHTML);
            });
            const innerHTML = node.innerHTML
              .replaceAll("<", "\n<")
              .replaceAll(">", ">\n");
            setDomNodes(innerHTML);
            observer.observe(node, OBSERVER_CONFIG);
            node.addEventListener("keyup", getCaretPosition);
          }}
        >
          <span data-font="serif" style={{ fontFamily: "serif" }}>
            ab
          </span>
          <span
            data-color="red"
            data-font="serif"
            style={{ color: "red", fontFamily: "serif" }}
          >
            cd
          </span>
        </div>
        <pre
          style={{
            textAlign: "left",
            fontSize: 18,
            gridColumn: "1",
            gridRow: "2",
            overflow: "auto",
          }}
        >
          {mutations}
        </pre>
        <pre
          style={{
            textAlign: "left",
            fontSize: 18,
            gridColumn: "2",
            gridRow: "2",
            wordBreak: "break-all",
          }}
        >
          {domNodes}
        </pre>
      </header>
    </div>
  );
}

export default App;
