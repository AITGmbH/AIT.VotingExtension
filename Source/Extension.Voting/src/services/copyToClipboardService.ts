import * as clipboard from "VSS/Utils/Clipboard";
import * as grids from "VSS/Controls/Grids";

export class CopyToClipboardService {
    private _clipboardOptions: clipboard.IClipboardOptions;

    constructor() {
        this._clipboardOptions = {
            copyAsHtml: true,
            showCopyDialog: false
        };
    }

    public copyToClipboard(data: string, options?: clipboard.IClipboardOptions): boolean {
        try {
            clipboard.copyToClipboard(data, Object.assign(this._clipboardOptions, options));
            return true;
        } catch (error) {
            return false;
        }
    }

    public copyGridContentToClipboard(grid: grids.Grid): boolean {
        if (!grid) {
            return;
        }
        let dataToCopyHtml = `<table style="box-sizing: border-box; border-collapse: collapse; border-spacing: 0px; margin: 0px; background-color: rgb(255, 255, 255); font-family: Calibri, sans-serif; font-size: 11pt">`;
        dataToCopyHtml += this.generateHeaderHtml(grid);
        dataToCopyHtml += this.generateBodyHtml(grid);

        dataToCopyHtml += `</table>`
        return this.copyToClipboard(dataToCopyHtml);
    }

    private generateHeaderHtml(grid: grids.Grid): string {
        const columns = this.getVisibleColumns(grid);
        let headersHtml = `<thead style="box-sizing: border-box; background-color: rgb(16, 110, 190); color: white">
            <tr style="box-sizing: border-box">`;

        for (const gridColumn of columns) {
            headersHtml += `<th style="box-sizing: border-box; border: 1px solid white; vertical-align: top; padding: 1.45pt 0.05in">${ gridColumn.text }
            </th>`
        }

        headersHtml += `</tr>
        </thead>`
        return headersHtml;
    }

    private generateBodyHtml(grid: grids.Grid): string {
        let bodyHtml = `<tbody style="box-sizing: border-box">`;

        const columns = this.getVisibleColumns(grid);

        const rowDataCount = grid.getLastRowDataIndex();
        for (let index = 0; index < rowDataCount; index++) {
            const element = grid.getRowData(index);
            bodyHtml += `<tr style="box-sizing: border-box">`;

            for (const column of columns) {

                if (column.index == "id") {
                    bodyHtml += `<td style="box-sizing: border-box; border: 1px solid white; vertical-align: top; padding: 1.45pt 0.05in"><a
                    href="${element["link"] }" target="_blank"
                    style="box-sizing: border-box; color: rgb(16, 110, 190)">${element[column.index] }</a></td>`
                } else {
                    const value = element[column.index] ? element[column.index] : "";
                    bodyHtml += `<td style="box-sizing: border-box; border: 1px solid white; vertical-align: top; padding: 1.45pt 0.05in">
                ${value }</td>`;
                }
            }
            bodyHtml += `</tr>`;
        }
        bodyHtml += `</tbody>`
        return bodyHtml;
    }

    private getVisibleColumns(grid: grids.Grid): grids.IGridColumn[] {
        let columns = [];
        for (const column of grid.getColumns()) {
            if (!column.hidden) {
                columns.push(column);
            }
        }
        return columns;
    }
}
