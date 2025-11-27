using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Printing;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace dochadzka
{
	/// <summary>
	/// Interaction logic for PrintPreview.xaml
	/// </summary>
	public partial class PrintPreview : Window
	{
		public PrintPreview(Grid visual1, Grid visual2)
		{
			InitializeComponent();

			Visibility v = visual1.Visibility;
			int w = (int)visual1.DesiredSize.Width;
			int h = (int)visual1.DesiredSize.Height;
			RenderTargetBitmap bitmap = new(
					//(int)(visual.Width is double.NaN ? 2480 : visual.Width), 
					//(int)(visual.Height is double.NaN ? 3508 : visual.Height), 
					w,
					h,
					96, 96, PixelFormats.Pbgra32);
			visual1.Visibility = Visibility.Visible;
			bitmap.Render(visual1);
			visual1.Visibility = v;
			imgPrintPreview1.Source = bitmap;
			//A4 pri 300dpi v pixeloch 3508 x 2480 px (297 x 210 mm)
			imgPrintPreview1.Width = w;
			imgPrintPreview1.Height = h;
			Width = w;
			Height = h;

			v = visual2.Visibility;
			w = (int)visual2.DesiredSize.Width;
			h = (int)visual2.DesiredSize.Height;
			RenderTargetBitmap bitmap2 = new(
					w,
					h,
					96, 96, PixelFormats.Pbgra32);
			visual2.Visibility = Visibility.Visible;
			bitmap2.Render(visual2);
			visual2.Visibility = v;
			imgPrintPreview2.Source = bitmap2;
			imgPrintPreview2.Width = w;
			imgPrintPreview2.Height = h;
			if (Width < w)
				Width = w;
			Height += h;

			if (Height > 1000)
				Height = 1000;
		}

		private void btnPrint_Click(object sender, RoutedEventArgs e)
		{
			//PrintDialog print = new();
			//print.PrintTicket.PageOrientation = PageOrientation.Landscape;
			//print.PrintTicket.PageMediaSize = new PageMediaSize(PageMediaSizeName.ISOA4);
			//if (print.ShowDialog() == true)
			//{
			//	print.PrintVisual(imgPrintPreview1, "Dochádzka - tlačenie dokumentu");
			//	print.PrintVisual(imgPrintPreview2, "Dochádzka - tlačenie dokumentu");
			//}

			try
			{
				var printDialog = new PrintDialog();
				printDialog.PrintTicket.PageOrientation = PageOrientation.Landscape;
				printDialog.PrintTicket.PageMediaSize = new PageMediaSize(PageMediaSizeName.ISOA4);
				if (printDialog.ShowDialog() == true)
				{
					var paginator = new DochadzkaPaginator(
						imgPrintPreview1,
						imgPrintPreview2
						);
					printDialog.PrintDocument(paginator, "Dochadzka");

				}
				Close();

			}
			catch (Exception ex)
			{
				Log.Error(ex, "btnPrint_Click:");
			}
		}
	}
}
