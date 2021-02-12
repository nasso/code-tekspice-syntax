import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerFoldingRangeProvider("nts", {
    provideFoldingRanges(document) {
      const commentReg = /^\s*#/; // regex to detect start of region
      const sectionStartReg = /^\s*\.\w+:/; // regex to detect start of region

      let ranges = [];
      let commentStart = null;
      let sectionStart = null;
      let lastNonEmpty = 0;

      // build folding regions
      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;

        if (commentReg.test(line)) {
          if (commentStart == null) {
            commentStart = i;
          }
        } else if (commentStart != null) {
          ranges.push(
            new vscode.FoldingRange(
              commentStart,
              i - 1,
              vscode.FoldingRangeKind.Comment
            )
          );

          commentStart = null;
        }

        if (sectionStartReg.test(line)) {
          if (sectionStart != null) {
            ranges.push(
              new vscode.FoldingRange(
                sectionStart,
                lastNonEmpty,
                vscode.FoldingRangeKind.Region
              )
            );
          }

          sectionStart = i;
        }

        if (line.trim() != "") {
          lastNonEmpty = i;
        }
      }

      // don't forget the last one!
      if (sectionStart != null) {
        ranges.push(
          new vscode.FoldingRange(
            sectionStart,
            document.lineCount - 1,
            vscode.FoldingRangeKind.Region
          )
        );
      }

      return ranges;
    },
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
