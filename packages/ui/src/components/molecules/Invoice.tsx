import { Page, Text, View, Image, Document, StyleSheet } from '@react-pdf/renderer';
import { p2ptransfer } from "@repo/db/type"
const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 50,
        border: '30px solid #E2136E',
    },
    second: {
        display: 'flex',
        flexDirection: 'row',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16
    },
    textSize: {
        fontSize: 11,
    },
    textWright: {
        fontWeight: "bold",
    },
    RightTextColor: {
        color: 'gray'
    },
    firstText: {
        paddingTop: 20
    },
    midText: {
        paddingVertical: 15
    },
    lastText: {
        paddingBottom: 20
    },
    title: {
        fontSize: 15,
        paddingBottom: 20,
        paddingTop: 20,
        borderTop: '0.3px solid black',
        borderBottom: '0.3px solid black',
        borderColor: 'black',
        fontWeight: 'extrabold'
    },
    date: {
        fontSize: 14,
        marginBottom: 8
    },
    status: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: 50,
        color: 'white',
        fontSize: 12,
        paddingHorizontal: 4,
        paddingVertical: 4,
        backgroundColor: 'blue',
        borderRadius: 99,
    },
    value: {
        fontSize: 26,
        marginBottom: 10
    },
    middleBorder: {
        borderRight: '0.3px solid black',
        marginLeft: 140,
        marginRight: 30
    }
});

interface InvoiceProps {
    invoice: p2ptransfer
}

export const Invoice = ({ invoice }: InvoiceProps) => {
    console.log("PDF --->", invoice);
    const timeStamp = new Date(invoice.timestamp).toLocaleString().split(",").reverse().join().replace(",", "  ")
    return (
        <Document >
            <Page style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <View style={{ "marginRight": 120 }}>
                            <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIWIEB1Etuw0r89kYr2dH4EMNDOJcJSinTdba8BiC9iH9Q_8HAnZK6Zxx2VidMrXOII_s&usqp=CAU" style={{ "width": 80, "height": 60 }} />
                        </View>
                    </View>
                    <View style={{ "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                        <View><Text style={{ "borderRight": "0.3px solid black" }}></Text></View>
                        <Text style={{ fontWeight: 'extrabold' }}>RECEIPT</Text>
                    </View>
                </View>
                {/* sender information */}
                <View>
                    <View>
                        <Text style={styles.title}>Sender Information</Text>
                    </View>
                    <View style={styles.second}>
                        <View>
                            <Text style={[styles.textSize, styles.firstText]}>Account Number</Text>
                            <Text style={[styles.textSize, styles.midText]}>Name</Text>
                            <Text style={[styles.textSize, styles.lastText]}>Time</Text>
                            <Text style={[styles.textSize, styles.lastText]}>Transaction ID</Text>
                        </View>
                        <Text style={styles.middleBorder}></Text>
                        <View>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.firstText]}>{invoice.fromUserId}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.user_p2ptransfer_fromUserIdTouser.name}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.lastText]}>{timeStamp}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.lastText]}>{invoice.transactionID}</Text>
                        </View>
                    </View>
                </View>

                {/* receiver information */}
                <View>
                    <View>
                        <Text style={styles.title}>Receiver Information</Text>
                    </View>
                    <View style={styles.second}>
                        <View>
                            <Text style={[styles.textSize, styles.firstText]}>Account Number</Text>
                            <Text style={[styles.textSize, styles.midText]}>Name</Text>
                            <Text style={[styles.textSize, styles.lastText]}>Time</Text>

                        </View>
                        <Text style={styles.middleBorder}></Text>
                        <View>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.firstText]}>{invoice.toUserId}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.user_p2ptransfer_toUserIdTouser.name}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.lastText]}>{timeStamp}</Text>
                        </View>
                    </View>
                </View>

                {/* Button */}
                <Text style={{ "borderTop": "0.3px solid black" }}></Text>
                <View style={{ "display": "flex", "flexDirection": "row", "height": "50px" }}>
                    <View style={{ "backgroundColor": "#00A651", "paddingVertical": 12, "width": "221px" }}>
                        <Text style={{ "paddingLeft": 10, "color": "white", "fontWeight": "extrabold", "fontSize": 13 }}>{invoice.transactionType === "Send" ? "Sent Amount" : "Received Amount"}</Text>
                    </View>
                    <Text style={{ "borderRight": "0.3px solid black" }}></Text>
                    <View style={{ "paddingVertical": 20, "marginLeft": 35 }}>
                        <Text style={[{ "color": "green" }, styles.textSize, styles.lastText, styles.textWright]}>{invoice.amount} {invoice.currency}</Text>
                    </View>
                </View>
                <Text style={{ "borderBottom": "0.3px solid black" }}></Text>
            </Page>
        </Document>
    )
}

// export async function GET(request: Request, { params }: { params: { invoiceId: string; }}) {
//   const invoice = {
//     id: 1,
//     name: 'Sample Invoice',
//     dateCreated: Date.now(),
//     value: 1234,
//     description: 'This is a sample invoice.',
//     status: 'open',
//     customer: {
//       name: 'John Smith',
//       email: 'john@smith.com'
//     }
//   };
//   const stream = await renderToStream(<Invoice invoice={invoice} />);
//   return new NextResponse(stream as unknown as ReadableStream)
// }